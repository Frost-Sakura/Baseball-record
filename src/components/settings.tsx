import React, { useState } from 'react';
import { Settings as SettingsIcon, Info, Database, Moon, AlertTriangle, Loader2 } from 'lucide-react';
import { db } from '../services/db';

export const Settings: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetSystem = async () => {
    setIsResetting(true);
    try {
      // 徹底刪除資料庫
      await db.delete();
      
      // 清除可能存在的本地快取
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('Database and storage cleared successfully.');
      
      // 稍微延遲一下讓使用者看到成功狀態
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error('Reset error:', err);
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
              <span className="desc">切換深色或淺色視覺主題</span>
            </div>
            <div className="control">
              <button className="btn-secondary small" onClick={() => alert('主題切換功能開發中')}>
                <Moon size={18} strokeWidth={1.5} />
                <span>切換</span>
              </button>
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
            <button 
              className="btn-danger" 
              onClick={() => setShowConfirm(true)}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
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
            <p>版本：v0.1.5-alpha</p>
            <p>本專案由 Antigravity 驅動，專為業餘與半專業棒球隊設計。</p>
          </div>
        </section>
      </div>

      {/* 自定義確認彈窗 - 確保不被瀏覽器攔截 */}
      {showConfirm && (
        <div className="modal-overlay danger">
          <div className="modal-content glass confirm-box">
            <div className="confirm-icon">
              {isResetting ? <Loader2 size={48} className="animate-spin" color="#e74c3c" /> : <AlertTriangle size={48} color="#e74c3c" />}
            </div>
            <h2>{isResetting ? '正在清除...' : '確認重設系統？'}</h2>
            <p>此動作將永久刪除「所有」球隊、球員與賽事紀錄，系統將恢復為初始狀態。</p>
            
            {!isResetting && (
              <div className="form-actions row">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowConfirm(false)}>
                  取消
                </button>
                <button type="button" className="btn-danger-solid flex-1" onClick={handleResetSystem}>
                  是的，全部刪除
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .settings-page { padding: var(--space-xl); max-width: 800px; margin: 0 auto; position: relative; }
        .settings-grid { display: flex; flex-direction: column; gap: var(--space-lg); margin-top: var(--space-xl); }
        .settings-section { padding: var(--space-xl); border-radius: var(--radius-lg); }
        .section-title { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); padding-bottom: var(--space-sm); border-bottom: 1px solid var(--border-color); color: var(--accent-primary); }
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-md) 0; }
        .setting-item:not(:last-child) { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .setting-item .label { display: block; font-weight: 600; font-size: 1.1rem; }
        .setting-item .desc { font-size: 0.85rem; color: var(--text-muted); }

        .btn-danger {
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.2);
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          pointer-events: auto;
        }
        .btn-danger:hover { background: #e74c3c; color: #fff; transform: translateY(-2px); }
        .btn-danger:active { transform: scale(0.95); }

        .btn-secondary.small { padding: 6px 12px; font-size: 0.9rem; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 5000; backdrop-filter: blur(20px); }
        .modal-content { padding: 40px; border-radius: 24px; width: 380px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
        .confirm-icon { margin-bottom: 20px; display: flex; justify-content: center; }
        .btn-danger-solid { background: #e74c3c; color: white; padding: 12px; border-radius: 12px; font-weight: 700; width: 100%; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .about-content { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }
      `}</style>
    </div>
  );
};
