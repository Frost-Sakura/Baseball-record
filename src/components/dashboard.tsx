import React, { useState } from 'react';
import { db, type Player } from '../services/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Activity, Database, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => db.players.toArray(),
  });

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newPlayer: Player = {
      name: formData.get('name') as string,
      number: formData.get('number') as string,
      position: (formData.get('position') as string).split(','),
      stats: { avg: 0, hr: 0, rbi: 0, era: 0 }
    };

    await db.players.add(newPlayer);
    queryClient.invalidateQueries({ queryKey: ['players'] });
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <div className="header-info">
          <h1>總覽控制台</h1>
          <p>歡迎回來，這是目前的球隊概況</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} />
          <span>新增球員</span>
        </button>
      </header>

      <div className="stats-grid">
        <StatCard icon={<Activity color="var(--accent-primary)" />} label="活躍賽事" value="4" />
        <StatCard icon={<Database color="var(--accent-blue)" />} label="總註冊球員" value={players?.length.toString() || '0'} />
      </div>

      <section className="recent-activity glass">
        <h3>最近加入的球員</h3>
        <div className="player-list">
          {isLoading ? (
            <p>載入中...</p>
          ) : players?.length === 0 ? (
            <p className="empty-state">目前還沒有球員資料</p>
          ) : (
            players?.map((p) => (
              <div key={p.id} className="player-item">
                <div className="avatar">{p.name[0]}</div>
                <div className="info">
                  <span className="name">{p.name}</span>
                  <span className="pos">#{p.number} | {p.position.join(', ')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 新增球員彈窗 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>新增球員設定</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddPlayer} className="player-form">
              <div className="form-group">
                <label>球員姓名</label>
                <input name="name" type="text" placeholder="例如：王小明" required />
              </div>
              <div className="form-group">
                <label>背號</label>
                <input name="number" type="text" placeholder="例如：1" required />
              </div>
              <div className="form-group">
                <label>守備位置 (以逗號分隔)</label>
                <input name="position" type="text" placeholder="例如：投手,一壘手" required />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">確認新增</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard {
          padding: var(--space-xl);
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-xl);
        }

        .btn-primary {
          background: var(--accent-primary);
          color: #000;
          font-weight: 600;
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .stat-card {
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .recent-activity {
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
        }

        .player-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .player-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          width: 400px;
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .close-btn {
          background: none;
          color: var(--text-muted);
        }

        .player-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .form-group label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .form-group input {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          color: var(--text-primary);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          margin-top: var(--space-md);
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="stat-card glass">
    <div className="icon">{icon}</div>
    <div className="stat-info">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  </div>
);
