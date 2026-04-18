import React from 'react';
import { Settings as SettingsIcon, Shield, Info, Database, Moon, Globe } from 'lucide-react';

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
            <SettingsIcon size={20} />
            <h3>一般設定</h3>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">主題模式</span>
              <span className="desc">切換深色或淺色視覺主題</span>
            </div>
            <div className="control">
              <Moon size={20} />
            </div>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">語言 / Language</span>
              <span className="desc">選擇介面顯示語言</span>
            </div>
            <div className="control">
              <Globe size={20} />
            </div>
          </div>
        </section>

        <section className="settings-section glass">
          <div className="section-title">
            <Database size={20} />
            <h3>資料管理</h3>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">離線資料庫狀態</span>
              <span className="desc">目前的 IndexedDB 儲存狀況</span>
            </div>
            <button className="btn-outline">備份資料</button>
          </div>
          <div className="setting-item">
            <div className="info">
              <span className="label">清除快取</span>
              <span className="desc">刪除本地快取的暫存資料</span>
            </div>
            <button className="btn-outline danger">清除</button>
          </div>
        </section>

        <section className="settings-section glass">
          <div className="section-title">
            <Info size={20} />
            <h3>關於 SmartScore</h3>
          </div>
          <div className="about-content">
            <p>版本：v0.1.0-alpha</p>
            <p>本專案為開發中版本，旨在提供最高品質的棒球紀錄體驗。</p>
          </div>
        </section>
      </div>

      <style>{`
        .settings-page {
          padding: var(--space-xl);
          max-width: 800px;
          margin: 0 auto;
        }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          margin-top: var(--space-xl);
        }

        .settings-section {
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
          padding-bottom: var(--space-sm);
          border-bottom: 1px solid var(--border-color);
          color: var(--accent-primary);
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) 0;
        }

        .setting-item:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .setting-item .label {
          display: block;
          font-weight: 600;
        }

        .setting-item .desc {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .btn-outline {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: var(--bg-tertiary);
          border-color: var(--text-muted);
        }

        .btn-outline.danger:hover {
          border-color: #ff4757;
          color: #ff4757;
        }

        .about-content {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};
