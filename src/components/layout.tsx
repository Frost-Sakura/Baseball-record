import React from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Users, Calendar, Settings, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      <aside className="sidebar glass">
        <div className="logo-section">
          <Trophy size={32} color="var(--accent-primary)" />
          <span className="logo-text">SmartScore</span>
        </div>
        
        <nav className="nav-menu">
          <NavItem to="/" icon={<Home size={20} />} label="首頁" />
          <NavItem to="/games" icon={<Calendar size={20} />} label="賽事紀錄" />
          <NavItem to="/teams" icon={<Users size={20} />} label="球隊/球員" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="設定" />
        </nav>
        
        <div className="status-footer">
          <div className="online-status">
            <div className="status-indicator"></div>
            <span>離線模式</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      <style>{`
        .layout-container {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: var(--space-xl) var(--space-md);
          border-right: 1px solid var(--border-color);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding-bottom: var(--space-xl);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: var(--space-xl);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .nav-menu {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
          border-left: 3px solid var(--accent-primary);
        }

        .main-content {
          flex: 1;
          background-color: var(--bg-primary);
        }

        .status-footer {
          padding-top: var(--space-md);
          border-top: 1px solid var(--border-color);
        }

        .online-status {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff4757; /* 離線紅 */
        }
      `}</style>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);
