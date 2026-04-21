import { db, type Player } from './db';

/**
 * 重新計算單一球員的所有累計數據
 * 目前支援打擊率 (AVG) 與全壘打 (HR)
 */
export const recalculatePlayerStats = async (playerId: number) => {
  if (!playerId) return;
  
  const logs = await db.gameLogs.where('batterId').equals(playerId).toArray();
  
  let hits = 0;
  let homeRuns = 0;
  let atBats = 0;
  // TODO: 打點 (RBI) 需要在日誌中記錄得分歸屬才能計算，目前暫保留預設值
  
  logs.forEach(log => {
    // 判定打數 (AB)
    // 安打、出局、因失誤上壘皆計為一個打數
    // 保送 (WALK)、觸身球 (HBP) 不計入打數
    if (log.actionType === 'HIT') {
      hits++;
      atBats++;
      if (log.result === '全壘打') homeRuns++;
    } else if (log.actionType === 'OUT' || log.actionType === 'ERROR') {
      atBats++;
    }
  });

  // 計算打擊率，保留三位小數
  const avg = atBats > 0 ? parseFloat((hits / atBats).toFixed(3)) : 0.000;

  const player = await db.players.get(playerId);
  if (player) {
    const updatedStats = {
      ...player.stats,
      avg,
      hr: homeRuns,
    };
    await db.players.update(playerId, { stats: updatedStats });
  }

  // 2. 計算投手數據 (Pitching Stats)
  const pitchingLogs = await db.gameLogs.where('pitcherId').equals(playerId).toArray();
  if (pitchingLogs.length > 0) {
    let outsRecorded = 0;
    let earnedRuns = 0; // TODO: 需實作責失分精確判定，目前先當作 0
    let strikeouts = 0;

    pitchingLogs.forEach(log => {
      if (log.actionType === 'OUT') {
        outsRecorded++;
        if (log.result.includes('K') || log.result.includes('三振')) strikeouts++;
      }
    });

    const inningsPitched = (outsRecorded / 3).toFixed(1); // 簡單版：1.0, 1.1, 1.2

    // TODO: 更新球員的投手專屬 stats 欄位 (如 IP, K, ER)，目前資料表未定義投手欄位，先保留擴展空間
    // await db.players.update(playerId, { stats: { ... } });
  }
};

/**
 * 賽後結算：更新該場賽事所有參與球員的數據
 */
export const recalculateGamePlayersStats = async (gameId: number) => {
  const logs = await db.gameLogs.where('gameId').equals(gameId).toArray();
  const playerIds = new Set<number>();
  
  logs.forEach(log => {
    if (log.batterId) playerIds.add(log.batterId);
    if (log.pitcherId) playerIds.add(log.pitcherId);
  });
  
  for (const pid of playerIds) {
    await recalculatePlayerStats(pid);
  }
};
