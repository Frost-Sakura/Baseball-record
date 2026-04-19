import React, { useState } from 'react';
import { Settings as SettingsIcon, Info, Database, Moon, AlertTriangle, Loader2 } from 'lucide-react';
import { db } from '../services/db';

export const Settings: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetSystem = async () => {
    setIsResetting(true);
    try {
      await db.delete();
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => { window.location.href = '/'; }, 1000);
    } catch (err) {
      alert('重設失敗，請嘗試手動清除瀏覽器資料。');
      setIsResetting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>系統設定</h1>
        <p>自定義你的紀錄環境與同步偏好</p>
      </header>

      <div className="settings-grid">
        <section className="settings-section glass">
          <div className="section-title">
            <SettingsIcon size={20} strokeWidth={1.5} />
            <h3>一般設定</h3>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">主題模式</span>
              <span className="desc">切換深色或淺色視覺主題 (目前僅支援亮色)</span>
            </div>
            <div className="control">
              <span className="wip-tag">WIP</span>
            </div>
          </div>
        </section>

        <section className="settings-section glass">
          <div className="section-title">
            <Database size={20} strokeWidth={1.5} />
            <h3>資料管理</h3>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">重設系統</span>
              <span className="desc">刪除所有本地資料（不可復原）</span>
            </div>
            <button className="btn-danger-outline" onClick={() => setShowConfirm(true)}>
              清除所有資料
            </button>
          </div>
        </section>

        <section className="settings-section glass">
          <div className="section-title">
            <Info size={20} strokeWidth={1.5} />
            <h3>關於 SmartScore</h3>
          </div>
          <div className="about-content">
            <p>版本：v0.2.0-light (Outdoor Optimized)</p>
            <p>本專案專為業餘與半專業棒球隊設計，優化強光下的閱讀體驗。</p>
          </div>
        </section>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="confirm-icon-large">
              {isResetting ? <Loader2 size={64} className="animate-spin" color="var(--accent-red)" /> : <AlertTriangle size={64} color="var(--accent-red)" />}
            </div>
            <h2 className="modal-title">{isResetting ? '正在清除...' : '確認重設系統？'}</h2>
            <p className="modal-desc">此動作將永久刪除「所有」球隊、球員與賽事紀錄，且無法復原。</p>
            
            {!isResetting && (
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowConfirm(false)}>取消</button>
                <button className="btn-danger-solid" onClick={handleResetSystem}>確認全部刪除</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .settings-page { padding: var(--space-xl); max-width: 800px; margin: 0 auto; }
        .settings-grid { display: flex; flex-direction: column; gap: var(--space-lg); margin-top: var(--space-xl); }
        .settings-section { padding: 32px; border-radius: 24px; background: white; border: 1px solid var(--border-color); }
        .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: var(--accent-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; }
        .section-title h3 { font-size: 1.2rem; font-weight: 800; }
        
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
        .setting-item .label { font-weight: 700; font-size: 1.1rem; }
        .setting-item .desc { font-size: 0.9rem; color: var(--text-muted); }
        
        .wip-tag { background: var(--bg-tertiary); color: var(--text-muted); padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 800; }
        
        .btn-danger-outline { border: 2px solid #fca5a5; color: var(--accent-red); padding: 10px 20px; border-radius: 12px; font-weight: 700; }
        .btn-danger-outline:hover { background: #fef2f2; border-color: var(--accent-red); }
        
        .text-center { text-align: center; }
        .confirm-icon-large { margin-bottom: 24px; display: flex; justify-content: center; }
        .modal-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 12px; }
        .modal-desc { color: var(--text-secondary); line-height: 1.6; }
        
        .btn-danger-solid { background: var(--accent-red); color: white; border-radius: 12px; font-weight: 800; }
        .btn-danger-solid:hover { background: #b91c1c; transform: translateY(-2px); }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .about-content { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.8; }
      `}</style>
    </div>
  );
};
