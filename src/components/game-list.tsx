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
        <div>
          <h1>賽事紀錄</h1>
          <p>查看過往與即將到來的賽事</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>開啟新比賽</span>
        </button>
      </header>

      <section className="game-stack">
        {isLoading ? (
          <p>載入中...</p>
        ) : games?.length === 0 ? (
          <div className="empty-state glass">
            <Calendar size={48} color="var(--text-muted)" />
            <h3>尚無賽事紀錄</h3>
            <p>點擊右上方按鈕開始你的第一場比賽紀錄</p>
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
                  <span className="location"><MapPin size={14} /> 新莊棒球場</span>
                  <span className="status-tag ongoing">進行中</span>
                </div>
              </div>
              <div className="game-score">
                <span className="score">0 - 0</span>
              </div>
              <ChevronRight size={24} color="var(--text-muted)" />
            </div>
          ))
        )}
      </section>

      <style>{`
        .game-page {
          padding: var(--space-xl);
          max-width: 1000px;
          margin: 0 auto;
        }

        .game-stack {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .game-item {
          display: flex;
          align-items: center;
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          gap: var(--space-xl);
          transition: transform 0.2s;
          cursor: pointer;
        }

        .game-item:hover {
          transform: translateX(10px);
          border-color: var(--accent-primary);
        }

        .game-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-tertiary);
          padding: var(--space-sm);
          border-radius: var(--radius-md);
          min-width: 60px;
        }

        .game-date .month {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-secondary);
        }

        .game-date .day {
          font-size: 1.2rem;
          font-weight: 800;
        }

        .game-info {
          flex: 1;
        }

        .teams {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: var(--space-xs);
        }

        .vs {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .meta {
          display: flex;
          gap: var(--space-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .location {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-tag.ongoing {
          background: rgba(46, 204, 113, 0.2);
          color: var(--accent-primary);
        }

        .game-score {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .empty-state {
          padding: var(--space-xl) * 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
          text-align: center;
        }
      `}</style>
    </div>
  );
};
