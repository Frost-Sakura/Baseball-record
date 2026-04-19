import React from 'react';
import { db } from '../services/db';
import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Shield, ShieldAlert, Star } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // 抓取所有球隊與球員以進行連動統計
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: () => db.teams.toArray() });
  const { data: players, isLoading } = useQuery({ queryKey: ['players'], queryFn: () => db.players.toArray() });

  const primaryTeamIds = teams?.filter(t => t.isPrimary).map(t => t.id) || [];
  const primaryPlayers = players?.filter(p => primaryTeamIds.includes(p.teamId)) || [];
  const otherPlayers = players?.filter(p => !primaryTeamIds.includes(p.teamId)) || [];

  return (
    <div className="dashboard">
      <header className="page-header">
        <div className="header-info">
          <h1>總覽控制台</h1>
          <p>這是你目前的球隊數據概況</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard icon={<Activity color="var(--accent-primary)" strokeWidth={1.5} />} label="活躍賽事" value="4" />
        <StatCard 
          icon={<Star fill="var(--accent-primary)" color="var(--accent-primary)" size={20} />} 
          label="本隊球員" 
          value={primaryPlayers.length.toString()} 
        />
        <StatCard 
          icon={<Database color="var(--accent-blue)" strokeWidth={1.5} />} 
          label="他隊球員" 
          value={otherPlayers.length.toString()} 
        />
      </div>

      <section className="recent-activity glass">
        <div className="section-header">
          <h3>最近加入的球員</h3>
        </div>
        <div className="player-list">
          {isLoading ? (
            <p className="loading-text">載入中...</p>
          ) : players?.length === 0 ? (
            <p className="empty-state">目前還沒有球員資料</p>
          ) : (
            players?.slice(-5).reverse().map((p) => {
              const isOurPlayer = primaryTeamIds.includes(p.teamId);
              return (
                <div key={p.id} className="player-item">
                  <div className={`avatar ${isOurPlayer ? 'our-team' : ''}`}>
                    {isOurPlayer ? <Star size={16} fill="currentColor" /> : p.name[0]}
                  </div>
                  <div className="info">
                    <div className="name-wrapper">
                      <span className="name">{p.name}</span>
                      {isOurPlayer && <Shield size={12} color="var(--accent-primary)" strokeWidth={2} />}
                    </div>
                    <span className="pos">#{p.number} | {p.position.join(', ')}</span>
                  </div>
                  <div className={`team-tag ${isOurPlayer ? 'primary' : ''}`}>
                    {isOurPlayer ? '本隊' : '他隊'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <style>{`
        .dashboard { padding: var(--space-xl) 40px; max-width: 1200px; margin: 0 auto; }
        .header-info h1 { font-size: 2.2rem; font-weight: 900; margin-bottom: 4px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .stat-card { padding: 24px; border-radius: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border-color); }
        .stat-card .label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .stat-card .value { font-size: 1.8rem; font-weight: 900; color: var(--text-primary); }

        .recent-activity { padding: 32px; border-radius: 24px; border: 1px solid var(--border-color); }
        .section-header { margin-bottom: 24px; }
        .section-header h3 { font-size: 1.2rem; font-weight: 800; }

        .player-list { display: flex; flex-direction: column; gap: 12px; }
        .player-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; transition: all 0.2s; border: 1px solid transparent; }
        .player-item:hover { background: rgba(255, 255, 255, 0.05); border-color: var(--border-color); }

        .avatar { width: 44px; height: 44px; border-radius: 12px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--text-secondary); }
        .avatar.our-team { background: rgba(46, 204, 113, 0.15); color: var(--accent-primary); border: 1px solid rgba(46, 204, 113, 0.3); }

        .name-wrapper { display: flex; align-items: center; gap: 6px; }
        .name { font-weight: 700; font-size: 1.1rem; }
        .pos { font-size: 0.85rem; color: var(--text-muted); }

        .team-tag { margin-left: auto; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; background: var(--bg-tertiary); color: var(--text-muted); }
        .team-tag.primary { background: var(--accent-primary); color: #000; }

        .loading-text { color: var(--text-muted); text-align: center; padding: 20px; }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="stat-card glass">
    <div className="icon">{icon}</div>
    <div className="stat-info">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  </div>
);
