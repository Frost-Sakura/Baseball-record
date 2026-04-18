import React, { useState } from 'react';
import { db, type Player } from '../services/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Edit2, Search } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => db.players.toArray(),
  });

  const handleDelete = async (id: number) => {
    if (confirm('確定要刪除這位球員嗎？')) {
      await db.players.delete(id);
      queryClient.invalidateQueries({ queryKey: ['players'] });
    }
  };

  const filteredPlayers = players?.filter(p => 
    p.name.includes(searchTerm) || p.number.includes(searchTerm)
  );

  return (
    <div className="management-page">
      <header className="page-header">
        <div>
          <h1>球隊與球員管理</h1>
          <p>管理你的球員名單與守備位置</p>
        </div>
        <div className="search-bar glass">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="搜尋姓名或背號..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <section className="player-grid">
        {isLoading ? (
          <p>載入中...</p>
        ) : filteredPlayers?.length === 0 ? (
          <div className="empty-state">未找到匹配的球員</div>
        ) : (
          filteredPlayers?.map((p) => (
            <div key={p.id} className="player-card glass">
              <div className="card-header">
                <div className="player-badge">#{p.number}</div>
                <div className="actions">
                  <button className="icon-btn" title="編輯"><Edit2 size={16} /></button>
                  <button className="icon-btn delete" title="刪除" onClick={() => p.id && handleDelete(p.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <h3>{p.name}</h3>
                <div className="positions">
                  {p.position.map(pos => <span key={pos} className="pos-tag">{pos}</span>)}
                </div>
              </div>
              <div className="card-footer">
                <div className="stat">
                  <span className="label">AVG</span>
                  <span className="value">{p.stats.avg}</span>
                </div>
                <div className="stat">
                  <span className="label">ERA</span>
                  <span className="value">{p.stats.era}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <style>{`
        .management-page {
          padding: var(--space-xl);
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          width: 300px;
        }

        .search-bar input {
          background: none;
          border: none;
          color: var(--text-primary);
          outline: none;
          width: 100%;
        }

        .player-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        .player-card {
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          transition: transform 0.2s;
        }

        .player-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-primary);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .player-badge {
          background: var(--accent-blue);
          color: #fff;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }

        .actions {
          display: flex;
          gap: var(--space-sm);
        }

        .icon-btn {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--accent-blue);
          color: #fff;
        }

        .icon-btn.delete:hover {
          background: #ff4757;
        }

        .card-body h3 {
          font-size: 1.4rem;
          margin-bottom: var(--space-xs);
        }

        .positions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
        }

        .pos-tag {
          background: var(--bg-tertiary);
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }

        .card-footer {
          display: flex;
          gap: var(--space-xl);
          padding-top: var(--space-md);
          border-top: 1px solid var(--border-color);
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat .label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .stat .value {
          font-weight: 700;
          color: var(--accent-primary);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-xl);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
