import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ExternalLink, Calendar, Newspaper, Clock, Filter } from 'lucide-react';
import { newsService } from '../services/news';
import { NewsItem } from '../services/db';

export const News: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const queryClient = useQueryClient();

  // 獲取本地新聞
  const { data: news, isLoading: isNewsLoading } = useQuery({
    queryKey: ['news', activeCategory],
    queryFn: () => newsService.getLocalNews(activeCategory),
  });

  // 獲取最後更新時間
  const { data: lastUpdate } = useQuery({
    queryKey: ['newsLastUpdate'],
    queryFn: () => newsService.getLastUpdateTime(),
  });

  // 刷新新聞的 Mutation
  const refreshMutation = useMutation({
    mutationFn: () => newsService.refreshNews(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['newsLastUpdate'] });
    },
  });

  // 初次載入時如果沒數據就自動刷新一次
  useEffect(() => {
    if (!isNewsLoading && (!news || news.length === 0)) {
      refreshMutation.mutate();
    }
  }, [news, isNewsLoading]);

  const categories = ['All', 'MLB', 'CPBL', 'NPB'];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastUpdate = (timestamp: number | null) => {
    if (!timestamp) return '尚未更新';
    const date = new Date(timestamp);
    return `上次更新：${date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div className="news-page-container">
      <header className="page-header glass">
        <div className="header-title">
          <Newspaper size={32} className="header-icon" />
          <h1>棒球新聞 <span className="badge">LIVE</span></h1>
        </div>
        
        <div className="header-actions">
          <div className="update-info">
            <Clock size={14} />
            <span>{formatLastUpdate(lastUpdate || null)}</span>
          </div>
          <button 
            className={`btn-refresh ${refreshMutation.isPending ? 'loading' : ''}`}
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw size={20} />
            <span>{refreshMutation.isPending ? '更新中...' : '刷新新聞'}</span>
          </button>
        </div>
      </header>

      <section className="filter-bar glass">
        <div className="filter-label">
          <Filter size={18} />
          <span>類別篩選</span>
        </div>
        <div className="filter-options">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' ? '全部新聞' : cat}
            </button>
          ))}
        </div>
      </section>

      <div className="news-grid">
        {isNewsLoading || refreshMutation.isPending ? (
          // Skeleton Loading
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="news-card skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-footer"></div>
              </div>
            </div>
          ))
        ) : (
          news?.map((item: NewsItem) => (
            <article key={item.id} className="news-card glass-hover">
              <div className="card-image-wrapper">
                <img src={item.imageUrl} alt={item.title} className="card-image" />
                <div className="card-category-badge">{item.category}</div>
              </div>
              <div className="card-content">
                <div className="card-meta">
                  <span className="card-source">{item.source}</span>
                  <span className="card-date">
                    <Calendar size={14} />
                    {formatDate(item.date)}
                  </span>
                </div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-excerpt">{item.content}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="card-link">
                  閱讀全文 <ExternalLink size={16} />
                </a>
              </div>
            </article>
          ))
        )}
      </div>

      {!isNewsLoading && news?.length === 0 && !refreshMutation.isPending && (
        <div className="empty-state glass">
          <Newspaper size={64} opacity={0.2} />
          <p>暫無新聞資料，請點擊右上角刷新</p>
        </div>
      )}

      <style>{`
        .news-page-container {
          padding: var(--space-xl);
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg) var(--space-xl);
          border-radius: 24px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .header-title h1 {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -1px;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .header-icon {
          color: var(--accent-primary);
        }

        .badge {
          font-size: 0.75rem;
          background: var(--accent-red);
          color: white;
          padding: 2px 8px;
          border-radius: 20px;
          vertical-align: middle;
          animation: pulse 2s infinite;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
        }

        .update-info {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: var(--accent-primary);
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
        }

        .btn-refresh:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
        }

        .btn-refresh.loading svg {
          animation: spin 1s linear infinite;
        }

        .filter-bar {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          padding: var(--space-md) var(--space-xl);
          border-radius: 16px;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.95rem;
        }

        .filter-options {
          display: flex;
          gap: var(--space-sm);
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: var(--accent-primary);
          color: white;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: var(--space-lg);
        }

        .news-card {
          border-radius: 24px;
          overflow: hidden;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .glass-hover:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-primary);
        }

        .card-image-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .news-card:hover .card-image {
          transform: scale(1.1);
        }

        .card-category-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          color: white;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .card-content {
          padding: var(--space-lg);
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .card-source {
          color: var(--accent-primary);
        }

        .card-date {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.4;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .card-excerpt {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: var(--space-md);
        }

        .card-link {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--accent-blue);
          font-size: 0.9rem;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl) * 2;
          border-radius: 24px;
          color: var(--text-muted);
          gap: var(--space-md);
          min-height: 300px;
        }

        /* Animations */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        /* Skeleton Styles */
        .skeleton {
          pointer-events: none;
        }

        .skeleton-image {
          height: 200px;
          background: var(--bg-tertiary);
          position: relative;
          overflow: hidden;
        }

        .skeleton-content {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .skeleton-title {
          height: 24px;
          width: 80%;
          background: var(--bg-tertiary);
          border-radius: 4px;
        }

        .skeleton-text {
          height: 60px;
          background: var(--bg-tertiary);
          border-radius: 4px;
        }

        .skeleton-footer {
          height: 20px;
          width: 40%;
          background: var(--bg-tertiary);
          border-radius: 4px;
        }

        .skeleton *::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-md);
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .filter-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-options {
            overflow-x: auto;
            width: 100%;
            padding-bottom: var(--space-xs);
          }
        }
      `}</style>
    </div>
  );
};
