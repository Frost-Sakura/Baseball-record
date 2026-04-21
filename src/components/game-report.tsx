import React from 'react';
import { db } from '../services/db';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Download } from 'lucide-react';

interface GameReportProps {
  gameId: number;
  onExit: () => void;
}

export const GameReport: React.FC<GameReportProps> = ({ gameId, onExit }) => {
  const { data: game } = useQuery({ queryKey: ['game', gameId], queryFn: () => db.games.get(gameId) });
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: () => db.teams.toArray() });
  const { data: logs } = useQuery({ queryKey: ['gameLogs', gameId], queryFn: () => db.gameLogs.where('gameId').equals(gameId).toArray() });

  const homeTeam = teams?.find(t => t.id === game?.homeTeamId);
  const awayTeam = teams?.find(t => t.id === game?.awayTeamId);

  const handleExportJSON = () => {
    if (!game || !logs) return;
    const exportData = {
      game,
      homeTeam,
      awayTeam,
      logs
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `smartscore_game_${gameId}_report.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!game) return <div>載入中...</div>;

  return (
    <div className="report-layout">
      <nav className="report-nav glass">
        <button className="back-btn" onClick={onExit}><ChevronLeft /> 返回列表</button>
        <h2>單場賽後戰報</h2>
        <button className="export-btn" onClick={handleExportJSON}><Download size={18} /> 匯出 JSON</button>
      </nav>

      <div className="report-content">
        {/* 最終比分看板 */}
        <div className="final-score-card glass">
          <div className="team-col">
            <h3>{awayTeam?.name || '客隊'}</h3>
            <span className="score">{game.score.away}</span>
          </div>
          <div className="vs">FINAL</div>
          <div className="team-col">
            <h3>{homeTeam?.name || '主隊'}</h3>
            <span className="score">{game.score.home}</span>
          </div>
        </div>

        {/* 逐球日誌 */}
        <div className="logs-section glass">
          <h3>賽事實況流水帳 (Play-by-play)</h3>
          <div className="logs-list">
            {logs?.map((log, idx) => (
              <div key={idx} className="log-item">
                <span className="inning-badge">
                  {log.inning}{log.half === 'top' ? '上' : '下'}
                </span>
                <span className="action-type">{log.actionType}</span>
                <span className="result">{log.result}</span>
              </div>
            ))}
            {logs?.length === 0 && <p className="text-muted">本場賽事尚無詳細日誌紀錄。</p>}
          </div>
        </div>
      </div>

      <style>{`
        .report-layout { max-width: 800px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .report-nav { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-radius: 16px; border: 1px solid var(--border-color); background: white; }
        .report-nav h2 { font-size: 1.4rem; font-weight: 900; }
        .back-btn { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-secondary); background: transparent; border: none; cursor: pointer; }
        .export-btn { display: flex; align-items: center; gap: 8px; font-weight: 700; color: white; background: var(--accent-primary); padding: 10px 16px; border-radius: 12px; cursor: pointer; border: none; }
        .export-btn:hover { background: #047857; }
        
        .final-score-card { display: flex; justify-content: space-between; align-items: center; padding: 48px; border-radius: 24px; background: white; border: 2px solid var(--border-color); margin-bottom: 24px; }
        .team-col { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; }
        .team-col h3 { font-size: 1.5rem; font-weight: 800; color: var(--text-secondary); margin: 0; }
        .team-col .score { font-size: 4rem; font-weight: 900; color: var(--accent-blue); line-height: 1; }
        .vs { font-size: 1.2rem; font-weight: 900; color: var(--accent-primary); padding: 6px 16px; background: #ecfdf5; border-radius: 8px; }

        .logs-section { padding: 32px; border-radius: 24px; background: white; border: 1px solid var(--border-color); }
        .logs-section h3 { font-size: 1.3rem; font-weight: 800; margin: 0 0 24px 0; color: var(--accent-primary); border-bottom: 2px solid var(--border-color); padding-bottom: 12px; }
        .logs-list { display: flex; flex-direction: column; gap: 12px; max-height: 500px; overflow-y: auto; padding-right: 8px; }
        .log-item { display: flex; align-items: center; gap: 16px; padding: 12px 16px; border-radius: 12px; background: var(--bg-primary); border: 1px solid #e2e8f0; }
        .inning-badge { font-weight: 900; color: white; background: var(--accent-primary); padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; }
        .action-type { font-weight: 800; color: var(--text-muted); width: 120px; }
        .result { font-weight: 800; font-size: 1.1rem; color: var(--text-primary); }
        
        .text-muted { color: var(--text-muted); font-weight: 700; text-align: center; padding: 20px; }
      `}</style>
    </div>
  );
};
