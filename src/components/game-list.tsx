import React, { useState } from 'react';
import { db } from '../services/db';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { GameSetup } from './game-setup';
import { LineupConfig } from './lineup-config';
import { GameScoring } from './game-scoring';
import { GameReport } from './game-report';

type ViewState = 'list' | 'setup' | 'lineup' | 'scoring' | 'report';

export const GameList: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [activeGameId, setActiveGameId] = useState<number | null>(null);

  const { data: games, isLoading: isLoadingGames } = useQuery({
    queryKey: ['games'],
    queryFn: () => db.games.reverse().toArray(),
  });

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => db.teams.toArray(),
  });

  const getTeamName = (id: number) => {
    return teams?.find(t => t.id === id)?.name || '未知球隊';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      month: months[d.getMonth()],
      day: d.getDate()
    };
  };

  const handleSetupComplete = (gameId: number) => {
    setActiveGameId(gameId);
    setViewState('lineup');
  };

  const handleLineupComplete = () => {
    setViewState('scoring');
  };

  const handleExitScoring = () => {
    setViewState('list');
    setActiveGameId(null);
  };

  // --- 根據狀態切換畫面 ---

  if (viewState === 'scoring' && activeGameId) {
    return <GameScoring gameId={activeGameId} onExit={handleExitScoring} />;
  }

  if (viewState === 'lineup' && activeGameId) {
    return (
      <LineupConfig 
        gameId={activeGameId} 
        onComplete={handleLineupComplete}
        onCancel={() => setViewState('list')}
      />
    );
  }

  if (viewState === 'report' && activeGameId) {
    return <GameReport gameId={activeGameId} onExit={() => { setViewState('list'); setActiveGameId(null); }} />;
  }

  return (
    <div className="game-page">
      <header className="page-header">
        <div className="header-info">
          <h1>賽事紀錄</h1>
          <p>管理所有比賽行程與歷史分數</p>
        </div>
        <button className="btn-primary" onClick={() => setViewState('setup')}>
          <Plus size={18} strokeWidth={2.5} />
          <span>開啟新比賽</span>
        </button>
      </header>

      <section className="game-stack">
        {isLoadingGames ? (
          <div className="loading-spinner">載入中...</div>
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
          games?.map((g) => {
            const { month, day } = formatDate(g.date);
            return (
                <div key={g.id} className="game-item glass" onClick={() => {
                  setActiveGameId(g.id!);
                  if (g.status === 'upcoming') setViewState('lineup');
                  else if (g.status === 'ongoing' || g.status === 'suspended') setViewState('scoring');
                  else if (g.status === 'finished') setViewState('report');
                }}>
                <div className="game-date">
                  <span className="month">{month}</span>
                  <span className="day">{day}</span>
                </div>
                <div className="game-info">
                  <div className="teams">
                    <span className="team">{getTeamName(g.homeTeamId)}</span>
                    <span className="vs">VS</span>
                    <span className="team">{getTeamName(g.awayTeamId)}</span>
                  </div>
                  <div className="meta">
                    <span className="location">
                      {g.status === 'upcoming' ? <Calendar size={14} /> : <MapPin size={14} />} 
                      {g.status === 'upcoming' ? '尚未開始' : g.status === 'ongoing' ? '進行中' : g.status === 'suspended' ? '保留中' : '已結束'}
                    </span>
                    <span className={`status-tag ${g.status}`}>{g.status}</span>
                  </div>
                </div>
                <div className="game-score">
                  <span className="score">{g.score.home} - {g.score.away}</span>
                </div>
                <button className="chevron-btn">
                  <ChevronRight size={24} strokeWidth={1.5} />
                </button>
              </div>
            );
          })
        )}
      </section>

      {/* 建立賽事彈窗 */}
      {viewState === 'setup' && (
        <GameSetup 
          onComplete={handleSetupComplete} 
          onCancel={() => setViewState('list')} 
        />
      )}

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
        .status-tag.upcoming { background: rgba(255, 255, 255, 0.1); color: var(--text-muted); }
        .status-tag.ongoing { background: rgba(46, 204, 113, 0.2); color: var(--accent-primary); }
        .status-tag.suspended { background: #fef3c7; color: #d97706; }
        .status-tag.finished { background: var(--bg-tertiary); color: var(--text-secondary); }
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
        .loading-spinner { padding: 40px; text-align: center; color: var(--text-muted); }
      `}</style>
    </div>
  );
};
