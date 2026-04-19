import React from 'react';
import { Settings as SettingsIcon, Info, Database, Moon, Globe } from 'lucide-react';

export const Settings: React.FC = () => {
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
              <button className="btn-secondary small">
                <Moon size={18} strokeWidth={1.5} />
                <span>切換</span>
              </button>
            </div>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">語言 / Language</span>
              <span className="desc">選擇介面顯示語言</span>
            </div>
            <div className="control">
              <button className="btn-secondary small">
                <Globe size={18} strokeWidth={1.5} />
                <span>繁體中文</span>
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
              <span className="label">離線資料庫狀態</span>
              <span className="desc">目前的 IndexedDB 儲存狀況</span>
            </div>
            <button className="btn-secondary">備份資料</button>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">重設系統</span>
              <span className="desc">刪除所有本地資料（不可復原）</span>
            </div>
            <button className="btn-danger">清除所有資料</button>
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

      <style>{`
        .settings-page { padding: var(--space-xl); max-width: 800px; margin: 0 auto; }
        .settings-grid { display: flex; flex-direction: column; gap: var(--space-lg); margin-top: var(--space-xl); }
        .settings-section { padding: var(--space-xl); border-radius: var(--radius-lg); }
        .section-title { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); padding-bottom: var(--space-sm); border-bottom: 1px solid var(--border-color); color: var(--accent-primary); }
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-md) 0; }
        .setting-item:not(:last-child) { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .setting-item .label { display: block; font-weight: 600; font-size: 1.1rem; }
        .setting-item .desc { font-size: 0.85rem; color: var(--text-muted); }

        /* 統一按鈕風格 */
        .btn-danger {
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.2);
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-danger:hover { background: #e74c3c; color: #fff; }

        .btn-secondary.small { padding: 6px 12px; font-size: 0.9rem; }

        .about-content { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }
      `}</style>
    </div>
  );
};
