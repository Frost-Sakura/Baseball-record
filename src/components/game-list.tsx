import React from 'react';
import { db } from '../services/db';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, MapPin, ChevronRight } from 'lucide-react';

export const GameList: React.FC = () => {
  const { data: games, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => db.games.toArray(),
  });

  return (
    <div className="game-page">
      <header className="page-header">
        <div className="header-info">
          <h1>賽事紀錄</h1>
          <p>管理所有比賽行程與歷史分數</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} strokeWidth={2.5} />
          <span>開啟新比賽</span>
        </button>
      </header>

      <section className="game-stack">
        {isLoading ? (
          <p>載入中...</p>
        ) : games?.length === 0 ? (
          <div className="empty-state-card glass">
            <div className="icon-wrapper">
              <Calendar size={64} strokeWidth={1} color="var(--text-muted)" />
            </div>
            <h3>目前尚無比賽紀錄</h3>
            <p>點擊右上方按鈕來建立你的第一場賽事紀錄吧！</p>
            <button className="btn-secondary" style={{ marginTop: 'var(--space-md)' }}>
              查看紀錄說明
            </button>
          </div>
        ) : (
          games?.map((g) => (
            <div key={g.id} className="game-item glass">
              <div className="game-date">
                <span className="month">APR</span>
                <span className="day">18</span>
              </div>
              <div className="game-info">
                <div className="teams">
                  <span className="team">Home Team</span>
                  <span className="vs">VS</span>
                  <span className="team">Away Team</span>
                </div>
                <div className="meta">
                  <span className="location"><MapPin size={14} strokeWidth={1.5} /> 新莊棒球場</span>
                  <span className="status-tag ongoing">進行中</span>
                </div>
              </div>
              <div className="game-score">
                <span className="score">0 - 0</span>
              </div>
              <button className="chevron-btn">
                <ChevronRight size={24} strokeWidth={1.5} />
              </button>
            </div>
          ))
        )}
      </section>

      <style>{`
        .game-page { padding: var(--space-xl); max-width: 1000px; margin: 0 auto; }
        .header-info h1 { font-size: 2.2rem; margin-bottom: 4px; }
        .game-stack { display: flex; flex-direction: column; gap: var(--space-md); }

        .game-item {
          display: flex; align-items: center; padding: 24px; border-radius: 20px;
          gap: var(--space-xl); transition: all 0.3s ease; cursor: pointer;
          border: 1px solid transparent;
        }
        .game-item:hover { transform: translateX(10px); background: rgba(255, 255, 255, 0.05); border-color: var(--accent-primary); }

        .game-date {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(46, 204, 113, 0.1); padding: 12px; border-radius: 12px;
          min-width: 70px; border: 1px solid rgba(46, 204, 113, 0.2);
        }
        .game-date .month { font-size: 0.75rem; font-weight: 800; color: var(--accent-primary); }
        .game-date .day { font-size: 1.4rem; font-weight: 900; }

        .game-info { flex: 1; }
        .teams { display: flex; align-items: center; gap: var(--space-md); font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
        .vs { font-size: 0.9rem; color: var(--text-muted); opacity: 0.6; }

        .meta { display: flex; gap: var(--space-md); font-size: 0.9rem; color: var(--text-secondary); }
        .location { display: flex; align-items: center; gap: 4px; }

        .status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .status-tag.ongoing { background: rgba(46, 204, 113, 0.2); color: var(--accent-primary); }

        .game-score { font-size: 1.8rem; font-weight: 900; color: var(--accent-primary); font-variant-numeric: tabular-nums; }
        
        .chevron-btn { background: none; color: var(--text-muted); transition: all 0.2s; }
        .game-item:hover .chevron-btn { color: var(--accent-primary); transform: translateX(5px); }

        .empty-state-card {
          padding: 80px 40px; display: flex; flex-direction: column; align-items: center;
          gap: 16px; text-align: center; border-radius: 32px;
        }
        .icon-wrapper { background: var(--bg-tertiary); padding: 30px; border-radius: 50%; margin-bottom: 8px; }
        .empty-state-card h3 { font-size: 1.5rem; margin: 0; }
        .empty-state-card p { color: var(--text-muted); max-width: 300px; }
      `}</style>
    </div>
  );
};
