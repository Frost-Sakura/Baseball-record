import React, { useState } from 'react';
import { db, type Player, type Team, type Game } from '../services/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, ChevronRight, ChevronLeft, Save, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LineupConfigProps {
  gameId: number;
  onComplete: () => void;
  onCancel: () => void;
}

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

export const LineupConfig: React.FC<LineupConfigProps> = ({ gameId, onComplete, onCancel }) => {
  const queryClient = useQueryClient();
  const [activeSide, setActiveSide] = useState<'home' | 'away'>('away'); // 通常客隊先打
  const [homeLineup, setHomeLineup] = useState<(number | null)[]>(Array(9).fill(null));
  const [awayLineup, setAwayLineup] = useState<(number | null)[]>(Array(9).fill(null));
  const [homePitcher, setHomePitcher] = useState<number | null>(null);
  const [awayPitcher, setAwayPitcher] = useState<number | null>(null);

  // 1. 抓取比賽資訊
  const { data: game } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => db.games.get(gameId),
  });

  // 2. 抓取兩隊資訊
  const { data: homeTeam } = useQuery({
    queryKey: ['team', game?.homeTeamId],
    queryFn: () => game ? db.teams.get(game.homeTeamId) : null,
    enabled: !!game,
  });

  const { data: awayTeam } = useQuery({
    queryKey: ['team', game?.awayTeamId],
    queryFn: () => game ? db.teams.get(game.awayTeamId) : null,
    enabled: !!game,
  });

  // 3. 抓取兩隊球員
  const { data: homePlayers } = useQuery({
    queryKey: ['players', game?.homeTeamId],
    queryFn: () => game ? db.players.where('teamId').equals(game.homeTeamId).toArray() : [],
    enabled: !!game,
  });

  const { data: awayPlayers } = useQuery({
    queryKey: ['players', game?.awayTeamId],
    queryFn: () => game ? db.players.where('teamId').equals(game.awayTeamId).toArray() : [],
    enabled: !!game,
  });

  const currentTeam = activeSide === 'home' ? homeTeam : awayTeam;
  const currentPlayers = activeSide === 'home' ? homePlayers : awayPlayers;
  const currentLineup = activeSide === 'home' ? homeLineup : awayLineup;
  const setLineup = activeSide === 'home' ? setHomeLineup : setAwayLineup;
  const currentPitcher = activeSide === 'home' ? homePitcher : awayPitcher;
  const setPitcher = activeSide === 'home' ? setHomePitcher : setAwayPitcher;

  const handleSelectPlayer = (slotIndex: number, playerId: number) => {
    const newLineup = [...currentLineup];
    newLineup[slotIndex] = playerId;
    setLineup(newLineup);
  };

  const isLineupComplete = (lineup: (number | null)[]) => lineup.every(id => id !== null);

  const handleSaveLineup = async () => {
    if (!isLineupComplete(homeLineup) || !isLineupComplete(awayLineup) || !homePitcher || !awayPitcher) {
      alert('請先排滿雙方 1-9 棒的先發名單，並設定先發投手');
      return;
    }

    try {
      await db.games.update(gameId, {
        lineups: {
          home: homeLineup as number[],
          away: awayLineup as number[],
          homePitcher,
          awayPitcher
        },
        status: 'ongoing' // 設定完陣容後，比賽狀態改為進行中
      });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      onComplete();
    } catch (err) {
      alert('儲存陣容失敗: ' + err);
    }
  };

  return (
    <div className="lineup-config-overlay">
      <div className="lineup-config-modal glass">
        <header className="lineup-header">
          <div className="header-nav">
            <button className="back-btn" onClick={onCancel}><ChevronLeft size={20} /> 返回賽事列表</button>
            <h1>設定先發打序</h1>
          </div>
          <div className="side-tabs">
            <button className={`tab-btn ${activeSide === 'away' ? 'active' : ''}`} onClick={() => setActiveSide('away')}>
              {awayTeam?.name} (客隊)
              {isLineupComplete(awayLineup) && <CheckCircle2 size={14} className="success-icon" />}
            </button>
            <button className={`tab-btn ${activeSide === 'home' ? 'active' : ''}`} onClick={() => setActiveSide('home')}>
              {homeTeam?.name} (主隊)
              {isLineupComplete(homeLineup) && <CheckCircle2 size={14} className="success-icon" />}
            </button>
          </div>
        </header>

        <div className="lineup-content">
          <div className="lineup-scroll-area">
            {/* 先發投手設定 */}
            <div className={`lineup-slot glass ${currentPitcher ? 'filled' : ''}`} style={{ marginBottom: '16px', border: currentPitcher ? '2px solid var(--accent-blue)' : '2px dashed var(--accent-blue)' }}>
              <div className="slot-number" style={{ background: 'var(--accent-blue)', color: 'white' }}>P</div>
              <div className="slot-info">
                {currentPitcher ? (
                  <>
                    <span className="player-name">{currentPlayers?.find(p => p.id === currentPitcher)?.name}</span>
                    <span className="player-meta">先發投手</span>
                  </>
                ) : (
                  <span className="placeholder">設定先發投手...</span>
                )}
              </div>
              <select 
                className="player-select" 
                value={currentPitcher || ''} 
                onChange={(e) => setPitcher(Number(e.target.value))}
              >
                <option value="">選擇投手</option>
                {currentPlayers?.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lineup-divider">先發打線 (1-9 棒)</div>

            {currentLineup.map((pId, idx) => {
              const selectedPlayer = currentPlayers?.find(p => p.id === pId);
              return (
                <div key={idx} className={`lineup-slot glass ${pId ? 'filled' : ''}`}>
                  <div className="slot-number">{idx + 1}</div>
                  <div className="slot-info">
                    {selectedPlayer ? (
                      <>
                        <span className="player-name">{selectedPlayer.name}</span>
                        <span className="player-meta">#{selectedPlayer.number} • {selectedPlayer.position.join('/')}</span>
                      </>
                    ) : (
                      <span className="placeholder">選擇打者...</span>
                    )}
                  </div>
                  <select 
                    className="player-select" 
                    value={pId || ''} 
                    onChange={(e) => handleSelectPlayer(idx, Number(e.target.value))}
                  >
                    <option value="">選擇球員</option>
                    {currentPlayers?.map(p => (
                      <option key={p.id} value={p.id} disabled={currentLineup.includes(p.id!)}>
                        #{p.number} {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <aside className="lineup-info-panel">
            <div className="info-card glass">
              <h3>陣容檢查</h3>
              <div className="check-list">
                <div className={`check-item ${isLineupComplete(awayLineup) && awayPitcher ? 'done' : ''}`}>
                  <div className="dot"></div> 客隊陣容已完成
                </div>
                <div className={`check-item ${isLineupComplete(homeLineup) && homePitcher ? 'done' : ''}`}>
                  <div className="dot"></div> 主隊陣容已完成
                </div>
              </div>
              <p className="hint"><AlertCircle size={14} /> 比賽開始後仍可進行球員更換。</p>
            </div>
            <button className="btn-primary start-btn" onClick={handleSaveLineup}>
              <Save size={18} />
              <span>進入計分板</span>
            </button>
          </aside>
        </div>
      </div>

      <style>{`
        .lineup-config-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-primary); z-index: 2500; display: flex; flex-direction: column; }
        .lineup-config-modal { flex: 1; display: flex; flex-direction: column; border: none; border-radius: 0; min-height: 0; }
        
        .lineup-header { padding: 40px 60px 20px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
        .header-nav { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
        .header-nav h1 { font-size: 2rem; font-weight: 900; }
        .back-btn { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-weight: 600; }
        .back-btn:hover { color: var(--text-primary); }

        .side-tabs { display: flex; gap: 12px; }
        .tab-btn { padding: 12px 24px; border-radius: 12px; background: rgba(255,255,255,0.05); color: var(--text-muted); font-weight: 800; display: flex; align-items: center; gap: 8px; border: 1px solid transparent; }
        .tab-btn.active { background: rgba(46, 204, 113, 0.1); color: var(--accent-primary); border-color: rgba(46, 204, 113, 0.3); }
        .success-icon { color: var(--accent-primary); }

        .lineup-content { flex: 1; display: grid; grid-template-columns: 1fr 320px; gap: 40px; padding: 20px 60px 0px; overflow: hidden; min-height: 0; }
        .lineup-scroll-area { overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 12px; padding-bottom: 80px; height: 100%; min-height: 0; }
        
        .lineup-slot { display: flex; align-items: center; padding: 14px 20px; border-radius: 16px; gap: 20px; transition: all 0.2s; border: 1px solid transparent; flex-shrink: 0; }
        .lineup-slot.filled { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); }
        .slot-number { width: 30px; height: 30px; background: var(--bg-tertiary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--text-muted); font-size: 0.85rem; flex-shrink: 0; }
        .lineup-slot.filled:not([style*="var(--accent-blue)"]) .slot-number { background: var(--accent-primary); color: #000; }
        
        .lineup-divider { text-align: center; font-size: 0.85rem; font-weight: 800; color: var(--text-muted); margin: 8px 0; letter-spacing: 1px; }
        
        .slot-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .player-name { font-size: 1.15rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .player-meta { font-size: 0.8rem; color: var(--text-muted); }
        .placeholder { color: var(--text-muted); opacity: 0.4; font-style: italic; }

        .player-select { width: 180px; height: 38px; font-size: 0.85rem !important; padding: 0 8px !important; flex-shrink: 0; cursor: pointer; }

        .lineup-info-panel { display: flex; flex-direction: column; gap: 20px; }
        .info-card { padding: 24px; border-radius: 20px; }
        .info-card h3 { margin-bottom: 20px; font-size: 1.1rem; }
        .check-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .check-item { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 0.9rem; }
        .check-item .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); opacity: 0.3; }
        .check-item.done { color: var(--text-primary); }
        .check-item.done .dot { background: var(--accent-primary); opacity: 1; box-shadow: 0 0 8px var(--accent-primary); }
        
        .hint { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .start-btn { height: 60px; font-size: 1.1rem; }
      `}</style>
    </div>
  );
};
