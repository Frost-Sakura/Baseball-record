import React, { useState } from 'react';
import { db, type Game, type Team } from '../services/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trophy, Calendar, ChevronRight, X, Settings2 } from 'lucide-react';

interface GameSetupProps {
  onComplete: (gameId: number) => void;
  onCancel: () => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onComplete, onCancel }) => {
  const queryClient = useQueryClient();
  const [homeTeamId, setHomeTeamId] = useState<number | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<number | null>(null);
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [innings, setInnings] = useState(9);

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => db.teams.toArray(),
  });

  const handleStartSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
      alert('請選擇兩支不同的球隊');
      return;
    }

    const newGame: Game = {
      date: gameDate,
      homeTeamId,
      awayTeamId,
      score: { home: 0, away: 0 },
      status: 'upcoming',
      settings: { innings }
    };

    try {
      const id = await db.games.add(newGame);
      queryClient.invalidateQueries({ queryKey: ['games'] });
      onComplete(id as number);
    } catch (err) {
      alert('建立賽事失敗: ' + err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content wide-setup">
        <header className="modal-header">
          <div className="title-area">
            <Trophy size={24} color="var(--accent-primary)" />
            <h2>建立新賽事</h2>
          </div>
          <button className="close-btn" onClick={onCancel}><X size={24} /></button>
        </header>

        <form onSubmit={handleStartSetup} className="setup-form">
          <div className="setup-grid">
            {/* 左側：球隊選擇 */}
            <div className="setup-section teams-pick">
              <div className="pick-box home glass">
                <label>主隊 (Home)</label>
                <select 
                  value={homeTeamId || ''} 
                  onChange={(e) => setHomeTeamId(Number(e.target.value))}
                  required
                >
                  <option value="">選擇球隊...</option>
                  {teams?.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === awayTeamId}>{t.name} {t.isPrimary ? '⭐' : ''}</option>
                  ))}
                </select>
                <div className="vs-badge">VS</div>
              </div>

              <div className="pick-box away glass">
                <label>客隊 (Away)</label>
                <select 
                  value={awayTeamId || ''} 
                  onChange={(e) => setAwayTeamId(Number(e.target.value))}
                  required
                >
                  <option value="">選擇球隊...</option>
                  {teams?.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === homeTeamId}>{t.name} {t.isPrimary ? '⭐' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 右側：賽事資訊 */}
            <div className="setup-section info-pick glass">
              <div className="form-group">
                <label><Calendar size={16} /> 比賽日期</label>
                <input type="date" value={gameDate} onChange={(e) => setGameDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label><Settings2 size={16} /> 比賽局數</label>
                <select value={innings} onChange={(e) => setInnings(Number(e.target.value))}>
                  <option value={9}>標準 (9局)</option>
                  <option value={7}>青少棒 (7局)</option>
                  <option value={5}>練習賽 (5局)</option>
                  <option value={3}>友誼賽 (3局)</option>
                </select>
              </div>
              <div className="setup-info-footer">
                <p>建立賽事後，下一步將設定雙方先發打序。</p>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>取消</button>
            <button type="submit" className="btn-primary">
              <span>設定打序</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .wide-setup { max-width: 800px !important; }
        .setup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .title-area { display: flex; align-items: center; gap: 12px; }
        .title-area h2 { font-size: 1.8rem; font-weight: 800; margin: 0; }
        
        .setup-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; margin-bottom: 12px; }
        .setup-section { display: flex; flex-direction: column; gap: 20px; }
        
        .teams-pick { position: relative; }
        .pick-box { padding: 32px; border-radius: 24px; position: relative; background: #f8fafc; border: 2px solid var(--border-color); }
        .pick-box label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: block; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; }
        .vs-badge { position: absolute; left: 50%; bottom: -12px; transform: translateX(-50%); background: var(--accent-primary); color: white; padding: 4px 14px; border-radius: 20px; font-weight: 900; font-size: 0.8rem; z-index: 10; border: 4px solid white; box-shadow: var(--shadow-sm); }
        
        .info-pick { padding: 24px; border-radius: 24px; background: #f1f5f9; border: 1px solid var(--border-color); }
        .form-group label { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; margin-bottom: 8px; color: var(--text-secondary); font-weight: 700; }
        .setup-info-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; }

        .modal-actions .btn-primary { padding-left: 32px; padding-right: 24px; }
      `}</style>
    </div>
  );
};
