import React, { useState, useEffect } from 'react';
import { db, type Player, type Team } from '../services/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Edit2, Search, Users, UserPlus, X, Plus, Trophy, Check, Star, AlertTriangle } from 'lucide-react';

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

export const TeamManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'team' | 'player', id: number, name: string } | null>(null);
  
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => db.teams.toArray(),
  });

  const selectedTeam = teams?.find(t => t.id === selectedTeamId);

  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players', selectedTeamId],
    queryFn: () => selectedTeamId ? db.players.where('teamId').equals(selectedTeamId).toArray() : [],
    enabled: !!selectedTeamId,
  });

  useEffect(() => {
    if (editingPlayer) setSelectedPositions(editingPlayer.position);
    else setSelectedPositions([]);
  }, [editingPlayer]);

  const togglePosition = (pos: string) => {
    setSelectedPositions(prev => prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]);
  };

  const handleTeamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamData: Team = { 
      name: formData.get('teamName') as string, 
      coach: formData.get('coach') as string,
      isPrimary: formData.get('isPrimary') === 'on'
    };

    try {
      if (teamData.isPrimary) {
        await db.teams.where('isPrimary').equals(1).modify({ isPrimary: false });
      }
      if (editingTeam?.id !== undefined) await db.teams.update(editingTeam.id, teamData);
      else { const id = await db.teams.add(teamData); setSelectedTeamId(id as number); }
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsTeamModalOpen(false);
    } catch (err) { alert('儲存失敗: ' + err); }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'team') {
        await db.teams.delete(deleteConfirm.id);
        await db.players.where('teamId').equals(deleteConfirm.id).delete();
        if (selectedTeamId === deleteConfirm.id) setSelectedTeamId(null);
        await queryClient.refetchQueries({ queryKey: ['teams'] });
      } else {
        await db.players.delete(deleteConfirm.id);
        await queryClient.refetchQueries({ queryKey: ['players', selectedTeamId] });
        await queryClient.invalidateQueries({ queryKey: ['players'] });
      }
      setDeleteConfirm(null);
    } catch (err) { alert('刪除失敗: ' + err); }
  };

  const handlePlayerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedTeamId === null) return;
    const formData = new FormData(e.currentTarget);
    const playerData: Player = {
      name: formData.get('name') as string, 
      number: formData.get('number') as string,
      position: selectedPositions, 
      teamId: selectedTeamId,
      stats: editingPlayer?.stats || { avg: 0, hr: 0, rbi: 0, era: 0 },
      details: selectedTeam?.isPrimary ? {
        battingSide: formData.get('battingSide') as 'L' | 'R' | 'S',
        throwingSide: formData.get('throwingSide') as 'L' | 'R',
        notes: formData.get('notes') as string,
      } : undefined
    };

    try {
      if (editingPlayer?.id !== undefined) await db.players.update(editingPlayer.id, playerData);
      else await db.players.add(playerData);
      await queryClient.invalidateQueries({ queryKey: ['players', selectedTeamId] });
      setIsPlayerModalOpen(false);
    } catch (err) { alert('儲存失敗: ' + err); }
  };

  return (
    <div className="team-management-layout">
      <aside className="teams-sidebar glass">
        <div className="sidebar-header">
          <h2>球隊列表</h2>
          <button type="button" className="add-action-btn" onClick={() => { setEditingTeam(null); setIsTeamModalOpen(true); }}>
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="teams-list">
          {isLoadingTeams ? <p>載入中...</p> : teams?.map((t) => (
            <div key={t.id} className={`team-item ${selectedTeamId === t.id ? 'active' : ''}`} onClick={() => t.id !== undefined && setSelectedTeamId(t.id)}>
              <div className="team-info">
                {t.isPrimary ? <Star size={16} fill="var(--accent-primary)" color="var(--accent-primary)" /> : <Trophy size={16} strokeWidth={1.5} color="var(--text-muted)" />}
                <span className="team-name">{t.name}</span>
              </div>
              <div className="team-actions">
                <button type="button" className="small-action-btn edit" onClick={(e) => { e.stopPropagation(); setEditingTeam(t); setIsTeamModalOpen(true); }}>
                  <Edit2 size={12} strokeWidth={2} />
                </button>
                <button type="button" className="small-action-btn delete" onClick={(e) => { e.stopPropagation(); t.id !== undefined && setDeleteConfirm({ type: 'team', id: t.id, name: t.name }); }}>
                  <Trash2 size={12} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="roster-content">
        {!selectedTeamId ? (
          <div className="empty-state-full">
            <div className="icon-bg"><Users size={64} strokeWidth={1} color="var(--text-muted)" /></div>
            <h2>管理球隊名單</h2>
            <p>請從左側選擇或建立一支隊伍</p>
          </div>
        ) : (
          <>
            <header className="roster-header">
              <div className="header-info">
                <div className="team-title-row">
                  {selectedTeam?.isPrimary ? <Star size={28} fill="var(--accent-primary)" color="var(--accent-primary)" /> : <Trophy size={28} color="var(--accent-primary)" strokeWidth={1.5} />}
                  <h1>{selectedTeam?.name}</h1>
                </div>
                <p>{selectedTeam?.isPrimary ? '我的核心隊伍' : '一般球隊'} • {players?.length || 0} 位球員</p>
              </div>
              <div className="header-actions">
                <div className="search-bar glass">
                  <Search size={18} strokeWidth={1.5} color="var(--text-muted)" />
                  <input type="text" placeholder="搜尋姓名或背號..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button type="button" className="btn-primary" onClick={() => { setEditingPlayer(null); setIsPlayerModalOpen(true); }}>
                  <UserPlus size={18} strokeWidth={2.5} />
                  <span>加入新成員</span>
                </button>
              </div>
            </header>

            <section className="player-grid">
              {isLoadingPlayers ? <p>載入中...</p> : players?.filter(p => p.name.includes(searchTerm) || p.number.includes(searchTerm)).map((p) => (
                <div key={p.id} className={`player-card glass ${selectedTeam?.isPrimary ? 'primary-card' : ''}`}>
                  <div className="card-top">
                    <div className="player-number">#{p.number}</div>
                    <div className="player-actions">
                      <button type="button" className="action-circle edit" onClick={() => { setEditingPlayer(p); setIsPlayerModalOpen(true); }}><Edit2 size={14} strokeWidth={2} /></button>
                      <button type="button" className="action-circle delete" onClick={() => p.id !== undefined && setDeleteConfirm({ type: 'player', id: p.id, name: p.name })}><Trash2 size={14} strokeWidth={2} /></button>
                    </div>
                  </div>
                  <div className="card-mid">
                    <h3 className="player-name">{p.name}</h3>
                    <div className="player-positions">
                      {p.position.map(pos => <span key={pos} className="badge">{pos}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay danger">
          <div className="modal-content glass confirm-box">
            <div className="confirm-icon"><AlertTriangle size={48} color="#e74c3c" /></div>
            <h2>確認刪除？</h2>
            <p>確定要刪除「{deleteConfirm.name}」？此動作無法復原。</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteConfirm(null)}>取消</button>
              <button type="button" className="btn-danger-solid" onClick={executeDelete}>確認刪除</button>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {isTeamModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>{editingTeam ? '編輯球隊' : '建立新球隊'}</h2>
              <button type="button" className="close-btn" onClick={() => setIsTeamModalOpen(false)}><X size={24} strokeWidth={1.5} /></button>
            </div>
            <form onSubmit={handleTeamSubmit} className="standard-form">
              <div className="form-group">
                <label>球隊名稱</label>
                <input name="teamName" type="text" defaultValue={editingTeam?.name} required />
              </div>
              <div className="form-group">
                <label>總教練</label>
                <input name="coach" type="text" defaultValue={editingTeam?.coach} />
              </div>
              <div className="form-group checkbox-group">
                <input type="checkbox" name="isPrimary" id="isPrimary" defaultChecked={editingTeam?.isPrimary} />
                <label htmlFor="isPrimary">標記為「我的球隊」</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsTeamModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">{editingTeam ? '更新球隊' : '建立球隊'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Modal */}
      {isPlayerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass wide">
            <div className="modal-header">
              <h2>{editingPlayer ? '編輯球員' : '新增球員'}</h2>
              <button type="button" className="close-btn" onClick={() => setIsPlayerModalOpen(false)}><X size={24} strokeWidth={1.5} /></button>
            </div>
            <form onSubmit={handlePlayerSubmit} className="standard-form">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>姓名</label>
                  <input name="name" type="text" defaultValue={editingPlayer?.name} required />
                </div>
                <div className="form-group flex-1">
                  <label>背號</label>
                  <input name="number" type="text" defaultValue={editingPlayer?.number} required />
                </div>
              </div>

              <div className="form-group">
                <label>守備位置 (複選)</label>
                <div className="position-selector">
                  {POSITIONS.map(pos => (
                    <button key={pos} type="button" className={`pos-chip ${selectedPositions.includes(pos) ? 'active' : ''}`} onClick={() => togglePosition(pos)}>
                      {selectedPositions.includes(pos) && <Check size={12} strokeWidth={2.5} />}
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTeam?.isPrimary && (
                <div className="detailed-section glass">
                  <div className="section-title">本隊詳細資訊</div>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>投球</label>
                      <select name="throwingSide" defaultValue={editingPlayer?.details?.throwingSide || 'R'}>
                        <option value="R">右投</option>
                        <option value="L">左投</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label>打擊</label>
                      <select name="battingSide" defaultValue={editingPlayer?.details?.battingSide || 'R'}>
                        <option value="R">右打</option>
                        <option value="L">左打</option>
                        <option value="S">兩打</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>備註</label>
                    <textarea name="notes" defaultValue={editingPlayer?.details?.notes} placeholder="輸入守備專長、備註..."></textarea>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsPlayerModalOpen(false)}>取消</button>
                <button type="submit" className="btn-primary">{editingPlayer ? '儲存球員' : '加入球員'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .team-management-layout { display: flex; height: calc(100vh - 64px); background: var(--bg-primary); }
        .teams-sidebar { width: 280px; border-right: 1px solid var(--border-color); padding: var(--space-xl) var(--space-md); display: flex; flex-direction: column; gap: var(--space-xl); background: rgba(255, 255, 255, 0.01); }
        
        button { cursor: pointer; border: none; outline: none; background: none; transition: all 0.2s; pointer-events: auto; }
        button:active { transform: scale(0.95); }
        
        .add-action-btn { width: 32px; height: 32px; border-radius: 10px; background: var(--accent-primary); color: #000; display: flex; align-items: center; justify-content: center; }
        .team-item { padding: 14px 16px; border-radius: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border: 1px solid transparent; }
        .team-item.active { background: rgba(46, 204, 113, 0.08); border-color: rgba(46, 204, 113, 0.4); color: var(--accent-primary); }
        
        .small-action-btn { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.1); color: var(--text-muted); }
        .small-action-btn.edit:hover { background: rgba(52, 152, 219, 0.2); color: #3498db; }
        .small-action-btn.delete:hover { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
        
        .roster-content { flex: 1; padding: 40px 60px; overflow-y: auto; }
        .roster-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
        .team-title-row { display: flex; align-items: center; gap: 16px; }
        .team-title-row h1 { font-size: 2.8rem; font-weight: 900; }
        
        .player-actions { display: flex; gap: 8px; position: relative; z-index: 50; }
        .action-circle { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.1); }
        .action-circle.edit { color: #3498db; background: rgba(52, 152, 219, 0.15); }
        .action-circle.delete { color: #e74c3c; background: rgba(231, 76, 60, 0.15); }
        
        .player-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 32px; }
        .player-card { padding: 28px; border-radius: 24px; border: 1px solid var(--border-color); position: relative; overflow: hidden; }
        .player-name { font-size: 1.8rem; font-weight: 800; margin: 20px 0 10px; }
        
        .position-selector { display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 8px; background: var(--bg-tertiary); padding: 12px; border-radius: 14px; margin-top: 6px; }
        .pos-chip { padding: 12px 4px; border-radius: 10px; background: white; border: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .pos-chip.active { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }
        
        .confirm-box { text-align: center; max-width: 380px !important; }
        .confirm-icon { margin-bottom: 16px; }
        .btn-danger-solid { background: #e74c3c; color: white; padding: 12px; border-radius: 12px; font-weight: 700; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 3000; backdrop-filter: blur(12px); }
        .modal-content { padding: 48px; border-radius: 32px; width: 460px; background: white; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); color: var(--text-primary); }
        .modal-content.wide { width: 560px; }
        .detailed-section { padding: 24px; border-radius: 20px; margin-top: 20px; background: #f8fafc; border: 1px solid var(--border-color); }
        
        /* 移除冗餘的 input 樣式，改用 index.css 全域定義 */
        .form-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; }
        .checkbox-group { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
        .checkbox-group input { width: 18px; height: 18px; cursor: pointer; }
        .checkbox-group label { font-size: 0.9rem; color: var(--accent-primary); font-weight: 600; cursor: pointer; margin-bottom: 0; }
      `}</style>
    </div>
  );
};
