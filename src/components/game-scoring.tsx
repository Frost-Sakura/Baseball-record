import React, { useState } from 'react';
import { db, type Game, type Player } from '../services/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, RotateCcw, Save, Users, Zap, AlertCircle, X, ChevronRight, ShieldAlert } from 'lucide-react';

interface GameScoringProps { gameId: number; onExit: () => void; }

interface GameStateSnapshot {
  inning: number; half: 'top' | 'bottom';
  balls: number; strikes: number; outs: number;
  runners: { 1: number | null, 2: number | null, 3: number | null };
  score: { home: number, away: number };
  homeBatterIdx: number; awayBatterIdx: number;
}

export const GameScoring: React.FC<GameScoringProps> = ({ gameId, onExit }) => {
  const queryClient = useQueryClient();
  const [inning, setInning] = useState(1);
  const [half, setHalf] = useState<'top' | 'bottom'>('top');
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [outs, setOuts] = useState(0);
  const [runners, setRunners] = useState<{ 1: number | null, 2: number | null, 3: number | null }>({ 1: null, 2: null, 3: null });
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [homeBatterIdx, setHomeBatterIdx] = useState(0);
  const [awayBatterIdx, setAwayBatterIdx] = useState(0);
  const [history, setHistory] = useState<GameStateSnapshot[]>([]);
  
  const [activeBaseMenu, setActiveBaseMenu] = useState<number | null>(null);
  const [showSpecialMenu, setShowSpecialMenu] = useState(false);
  const [showErrorSelector, setShowErrorSelector] = useState(false);

  const { data: game } = useQuery({ queryKey: ['game', gameId], queryFn: () => db.games.get(gameId) });
  const { data: homePlayers } = useQuery({ queryKey: ['players', game?.homeTeamId], queryFn: () => game ? db.players.where('teamId').equals(game.homeTeamId).toArray() : [], enabled: !!game });
  const { data: awayPlayers } = useQuery({ queryKey: ['players', game?.awayTeamId], queryFn: () => game ? db.players.where('teamId').equals(game.awayTeamId).toArray() : [], enabled: !!game });

  const currentBatterIdx = half === 'top' ? awayBatterIdx : homeBatterIdx;
  const currentLineup = half === 'top' ? game?.lineups?.away : game?.lineups?.home;
  const currentBatterId = currentLineup ? currentLineup[currentBatterIdx] : null;
  const currentBatter = (half === 'top' ? awayPlayers : homePlayers)?.find(p => p.id === currentBatterId);
  const defensivePlayers = half === 'top' ? homePlayers : awayPlayers;

  const saveToHistory = () => {
    const snapshot: GameStateSnapshot = { inning, half, balls, strikes, outs, runners: { ...runners }, score: { ...score }, homeBatterIdx, awayBatterIdx };
    setHistory(prev => [snapshot, ...prev].slice(0, 20));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const [lastState, ...rest] = history;
    setInning(lastState.inning); setHalf(lastState.half); setBalls(lastState.balls); setStrikes(lastState.strikes);
    setOuts(lastState.outs); setRunners(lastState.runners); setScore(lastState.score);
    setHomeBatterIdx(lastState.homeBatterIdx); setAwayBatterIdx(lastState.awayBatterIdx);
    setHistory(rest);
  };

  const resetCount = () => { setBalls(0); setStrikes(0); };
  const nextBatter = () => { resetCount(); if (half === 'top') setAwayBatterIdx(p => (p + 1) % 9); else setHomeBatterIdx(p => (p + 1) % 9); };

  const handleBall = () => { saveToHistory(); if (balls === 3) handleWalk(); else setBalls(p => p + 1); };
  const handleStrike = () => { saveToHistory(); if (strikes === 2) handleOut(); else setStrikes(p => p + 1); };
  const handleOut = () => {
    saveToHistory();
    if (outs === 2) { 
      setOuts(0); setRunners({ 1: null, 2: null, 3: null }); 
      if (half === 'bottom') { setInning(p => p + 1); setHalf('top'); } else setHalf('bottom'); 
    } else setOuts(p => p + 1);
    nextBatter();
  };

  const handleWalk = () => {
    saveToHistory();
    const newRunners = { ...runners }; let runs = 0;
    if (newRunners[1]) { if (newRunners[2]) { if (newRunners[3]) runs++; newRunners[3] = newRunners[2]; } newRunners[2] = newRunners[1]; }
    newRunners[1] = currentBatterId; setRunners(newRunners);
    if (runs > 0) setScore(s => ({ ...s, [half === 'top' ? 'away' : 'home']: s[half === 'top' ? 'away' : 'home'] + runs }));
    nextBatter();
  };

  const handleHit = (bases: number) => {
    saveToHistory();
    const newRunners = { 1: null, 2: null, 3: null } as any; let runs = 0;
    [3, 2, 1].forEach(base => {
      const rid = (runners as any)[base];
      if (rid) { if (base + bases > 3) runs++; else newRunners[base + bases] = rid; }
    });
    if (bases > 3) runs++; else newRunners[bases] = currentBatterId;
    setRunners(newRunners);
    if (runs > 0) setScore(s => ({ ...s, [half === 'top' ? 'away' : 'home']: s[half === 'top' ? 'away' : 'home'] + runs }));
    nextBatter();
  };

  const handleRunnerSteal = (fromBase: number) => {
    saveToHistory();
    const newRunners = { ...runners };
    const rid = (newRunners as any)[fromBase];
    if (rid) {
      (newRunners as any)[fromBase] = null;
      if (fromBase === 3) setScore(s => ({ ...s, [half === 'top' ? 'away' : 'home']: s[half === 'top' ? 'away' : 'home'] + 1 }));
      else (newRunners as any)[fromBase + 1] = rid;
    }
    setRunners(newRunners); setActiveBaseMenu(null);
  };

  const handleRunnerOut = (fromBase: number) => {
    saveToHistory();
    const newRunners = { ...runners }; (newRunners as any)[fromBase] = null; setRunners(newRunners);
    if (outs === 2) { setOuts(0); setRunners({ 1: null, 2: null, 3: null }); setHalf(h => h === 'top' ? 'bottom' : 'top'); if (half === 'bottom') setInning(i => i + 1); }
    else setOuts(p => p + 1);
    setActiveBaseMenu(null);
  };

  return (
    <div className="scoring-layout">
      <nav className="scoring-nav glass">
        <button className="back-btn" onClick={onExit}><ChevronLeft /> 返回</button>
        <div className="game-summary">
          <div className="team-score"><span>{half === 'top' ? '主' : '客'} (守)</span><span className="points">{half === 'top' ? score.home : score.away}</span></div>
          <div className="vs-divider">:</div>
          <div className="team-score"><span className="points">{half === 'top' ? score.away : score.home}</span><span>{half === 'top' ? '客' : '主'} (攻)</span></div>
        </div>
        <button className="save-btn"><Save size={18} /> 存檔</button>
      </nav>

      <main className="scoring-main">
        <section className="dashboard-section">
          <div className="scoreboard-card glass">
            <div className="inning-indicator"><span className="num">{inning}</span><span className="half">{half === 'top' ? '▲' : '▼'}</span></div>
            <div className="count-display">
              <div className="count-row"><span className="label">B</span><div className="dots">{[1, 2, 3].map(i => <div key={i} className={`dot ball ${balls >= i ? 'active' : ''}`}></div>)}</div></div>
              <div className="count-row"><span className="label">S</span><div className="dots">{[1, 2].map(i => <div key={i} className={`dot strike ${strikes >= i ? 'active' : ''}`}></div>)}</div></div>
              <div className="count-row"><span className="label">O</span><div className="dots">{[1, 2].map(i => <div key={i} className={`dot out ${outs >= i ? 'active' : ''}`}></div>)}</div></div>
            </div>
          </div>

          <div className="field-visual">
            <div className="diamond-grid">
              {[2, 3, 1].map(b => (
                <div key={b} className={`base b${b} ${runners[b as 1|2|3] ? 'has-runner' : ''}`} onClick={() => runners[b as 1|2|3] && setActiveBaseMenu(b)}>
                  <div className={`runner ${runners[b as 1|2|3] ? 'active' : ''}`}></div>
                  {activeBaseMenu === b && (
                    <div className="base-action-menu glass" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleRunnerSteal(b)}>推進/盜壘</button>
                      <button className="danger" onClick={() => handleRunnerOut(b)}>牽制/出局</button>
                      <button className="cancel" onClick={() => setActiveBaseMenu(null)}><X size={14}/></button>
                    </div>
                  )}
                </div>
              ))}
              <div className="base home"></div>
            </div>
            
            <div className="strike-zone-container glass">
              <div className="k-zone" onClick={handleBall}>
                <div className="inner-grid" onClick={(e) => { e.stopPropagation(); handleStrike(); }}>
                  {[...Array(9)].map((_, i) => <div key={i} className="cell"></div>)}
                </div>
              </div>
              <div className="zone-label">STRIKE ZONE</div>
            </div>
          </div>

          <div className="current-batter-card glass">
            <div className="batter-info">
              <span className="order">第 {currentBatterIdx + 1} 棒</span>
              <h2>{currentBatter?.name || '未設定'}</h2>
              <span className="stats">AVG .320 | HR 2</span>
            </div>
            <div className="batter-icon"><Users size={32} /></div>
          </div>
        </section>

        <section className="actions-section">
          <div className="action-group results">
            <button className="action-btn hit hit-1" onClick={() => handleHit(1)}>一壘安打</button>
            <button className="action-btn hit hit-2" onClick={() => handleHit(2)}>二壘安打</button>
            <button className="action-btn hit hit-3" onClick={() => handleHit(3)}>三壘安打</button>
            <button className="action-btn hit-hr" onClick={() => handleHit(4)}>全壘打</button>
          </div>

          <div className="action-group secondary">
            <button className="action-btn foul" onClick={() => { saveToHistory(); if (strikes < 2) setStrikes(s => s + 1); }}>界外 (F)</button>
            <button className="action-btn out-manual" onClick={handleOut}>直接出局</button>
            <button className="action-btn error" onClick={() => setShowErrorSelector(true)}>失誤上壘</button>
          </div>
          
          <div className="footer-actions">
            <button className={`tool-btn undo ${history.length > 0 ? 'active' : ''}`} onClick={handleUndo} disabled={history.length === 0}><RotateCcw size={16} /> 復原</button>
            <button className="tool-btn special active" onClick={() => setShowSpecialMenu(true)}><Zap size={16} /> 特殊紀錄</button>
          </div>
        </section>
      </main>

      {/* 彈窗選擇器 (亮色優化) */}
      {(showErrorSelector || showSpecialMenu) && (
        <div className="overlay-popup" onClick={() => { setShowErrorSelector(false); setShowSpecialMenu(false); }}>
          <div className="selector-card glass" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <h3>{showErrorSelector ? '記錄失誤對象' : '特殊紀錄'}</h3>
              <button onClick={() => { setShowErrorSelector(false); setShowSpecialMenu(false); }}><X/></button>
            </div>
            
            {showErrorSelector && (
              <div className="player-list-scroll">
                {defensivePlayers?.map(p => (
                  <button key={p.id} className="player-pick-btn" onClick={() => handleErrorRecord(p)}>
                    <span className="num">#{p.number}</span>
                    <span className="name">{p.name}</span>
                    <span className="pos">{p.position.join('/')}</span>
                  </button>
                ))}
              </div>
            )}

            {showSpecialMenu && (
              <div className="menu-grid">
                <button className="menu-item" onClick={() => { handleWalk(); setShowSpecialMenu(false); }}>觸身球 (HBP)</button>
                <button className="menu-item" onClick={() => { handleWalk(); setShowSpecialMenu(false); }}>故意四壞 (IBB)</button>
                <button className="menu-item" onClick={() => { handleOut(); setShowSpecialMenu(false); }}>不死三振 (K-WP)</button>
                <button className="menu-item" onClick={() => { alert('妨礙打擊已記錄'); setShowSpecialMenu(false); }}>妨礙打擊</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .scoring-layout { height: 100vh; background: var(--bg-primary); display: flex; flex-direction: column; overflow: hidden; color: var(--text-primary); }
        .scoring-nav { height: 72px; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; background: white; border-bottom: 1px solid var(--border-color); }
        .game-summary { display: flex; align-items: center; gap: 32px; }
        .team-score { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.1rem; }
        .team-score .points { font-size: 2.2rem; color: var(--accent-blue); font-variant-numeric: tabular-nums; }
        .vs-divider { opacity: 0.3; font-weight: 900; }

        .scoring-main { flex: 1; display: grid; grid-template-columns: 1fr 400px; gap: 40px; padding: 24px 40px; }
        .dashboard-section { display: flex; flex-direction: column; align-items: center; gap: 24px; }
        
        .scoreboard-card { width: 100%; max-width: 500px; padding: 24px 32px; border-radius: 24px; display: flex; align-items: center; gap: 40px; background: white; border: 2px solid var(--border-color); }
        .inning-indicator { display: flex; flex-direction: column; align-items: center; }
        .inning-indicator .num { font-size: 3.5rem; font-weight: 900; line-height: 1; }
        .inning-indicator .half { font-size: 1.2rem; color: var(--accent-primary); margin-top: 4px; }
        
        .count-display { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .count-row { display: flex; align-items: center; gap: 20px; }
        .count-row .label { font-weight: 900; color: var(--text-muted); width: 16px; }
        .dots { display: flex; gap: 12px; }
        .dot { width: 16px; height: 16px; border-radius: 50%; background: var(--bg-tertiary); border: 1px solid var(--border-color); }
        .dot.ball.active { background: #2563eb; box-shadow: 0 0 10px rgba(37, 99, 235, 0.4); border-color: #1e40af; }
        .dot.strike.active { background: #ea580c; box-shadow: 0 0 10px rgba(234, 88, 12, 0.4); border-color: #9a3412; }
        .dot.out.active { background: #dc2626; box-shadow: 0 0 10px rgba(220, 38, 38, 0.4); border-color: #991b1b; }

        .field-visual { display: flex; align-items: center; gap: 80px; margin: 10px 0; }
        .diamond-grid { position: relative; width: 200px; height: 200px; }
        .base { position: absolute; width: 40px; height: 40px; background: white; border: 3px solid var(--border-color); transition: all 0.2s; box-shadow: var(--shadow-sm); }
        .base.has-runner { border-color: var(--accent-primary); cursor: pointer; background: #ecfdf5; }
        .base:not(.home) { transform: rotate(45deg); }
        .b2 { top: 0; left: 50%; transform: translate(-50%, 0) rotate(45deg) !important; }
        .b1 { top: 50%; right: 0; transform: translate(0, -50%) rotate(45deg) !important; }
        .b3 { top: 50%; left: 0; transform: translate(0, -50%) rotate(45deg) !important; }
        .home { bottom: 0; left: 50%; transform: translate(-50%, 0); clip-path: polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%); background: #f1f5f9; border: none; height: 44px; width: 44px; }
        .runner { width: 100%; height: 100%; background: var(--accent-primary); opacity: 0; transition: all 0.3s; }
        .runner.active { opacity: 1; }

        .base-action-menu { position: absolute; top: -110px; left: 50%; transform: translateX(-50%) rotate(-45deg); width: 180px; background: white; padding: 10px; border-radius: 12px; border: 2px solid var(--accent-primary); box-shadow: var(--shadow-lg); z-index: 500; }
        .base-action-menu button { width: 100%; padding: 10px; text-align: left; font-weight: 700; font-size: 0.9rem; border-radius: 8px; }
        .base-action-menu button:hover { background: var(--bg-primary); }
        .base-action-menu button.danger { color: var(--accent-red); }

        .strike-zone-container { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .k-zone { width: 220px; height: 260px; background: #f8fafc; border: 2px dashed var(--border-color); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: crosshair; }
        .inner-grid { width: 140px; height: 180px; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); border: 3px solid var(--text-secondary); background: white; }
        .cell { border: 1px solid #e2e8f0; }
        .cell:hover { background: rgba(5, 150, 105, 0.1); }
        .zone-label { font-size: 0.75rem; font-weight: 900; color: var(--text-muted); letter-spacing: 2px; }

        .current-batter-card { width: 100%; max-width: 500px; padding: 20px 32px; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; background: white; border: 2px solid var(--border-color); }
        .batter-info h2 { font-size: 2.2rem; font-weight: 900; margin: 4px 0; }
        .batter-info .order { color: var(--accent-blue); font-weight: 900; }

        .actions-section { display: flex; flex-direction: column; gap: 16px; }
        .action-group { display: grid; gap: 12px; }
        .results { grid-template-columns: 1fr 1fr; }
        .secondary { grid-template-columns: 1fr 1fr 1fr; }
        
        .action-btn { height: 72px; border-radius: 16px; font-weight: 800; font-size: 1.1rem; border: 2px solid var(--border-color); background: white; box-shadow: var(--shadow-sm); }
        .action-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--text-secondary); }
        
        .action-btn.hit { border-color: var(--accent-blue); color: var(--accent-blue); background: #f0f9ff; }
        .action-btn.hit:hover { background: var(--accent-blue); color: white; }
        .action-btn.hit-hr { grid-column: span 2; border-color: var(--accent-primary); color: var(--accent-primary); background: #f0fdf4; }
        .action-btn.hit-hr:hover { background: var(--accent-primary); color: white; }
        
        .action-btn.foul { color: #ea580c; border-color: #fdba74; }
        .action-btn.out-manual { color: #dc2626; border-color: #fca5a5; }

        .footer-actions { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .tool-btn { height: 52px; border-radius: 14px; border: 2px solid var(--border-color); background: white; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .tool-btn.active { border-color: var(--text-primary); color: var(--text-primary); }

        .overlay-popup { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); z-index: 6000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .selector-card { width: 440px; padding: 32px; border-radius: 28px; background: white; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .card-header h3 { font-size: 1.6rem; font-weight: 900; }
        
        .player-list-scroll { max-height: 450px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .player-pick-btn { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-radius: 16px; border: 2px solid #f1f5f9; background: #f8fafc; }
        .player-pick-btn:hover { border-color: var(--accent-red); background: #fef2f2; }
        .player-pick-btn .num { font-weight: 900; color: var(--accent-blue); width: 32px; font-size: 1.2rem; }
        .player-pick-btn .name { flex: 1; font-weight: 800; font-size: 1.2rem; }
        
        .menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .menu-item { padding: 24px; border-radius: 16px; background: #f8fafc; border: 2px solid #e2e8f0; font-weight: 800; font-size: 1.1rem; }
        .menu-item:hover { border-color: var(--accent-primary); color: var(--accent-primary); background: #f0fdf4; }
      `}</style>
    </div>
  );
};
