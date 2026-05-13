import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ExternalLink, Calendar, Newspaper, Clock, Filter, ChevronRight, CheckCircle2 } from 'lucide-react';
import { newsService } from '../services/news';
import type { NewsItem } from '../services/db';

export const News: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const loaderRef = useRef<HTMLDivElement>(null);

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
    mutationFn: async () => {
      // 紀錄刷新前的第一則新聞連結
      const beforeLink = news && news.length > 0 ? news[0].url : null;
      await newsService.refreshNews();
      return { beforeLink };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news'] }).then(() => {
        // 抓取刷新後的新聞來比對
        const freshNews = queryClient.getQueryData(['news', activeCategory]) as NewsItem[];
        const afterLink = freshNews && freshNews.length > 0 ? freshNews[0].url : null;
        
        if (data.beforeLink === afterLink && afterLink !== null) {
          showToast('已是最新戰報');
        } else {
          showToast('戰報已更新');
        }
      });
      queryClient.invalidateQueries({ queryKey: ['newsLastUpdate'] });
    },
    onError: (error) => {
      console.error('Refresh failed:', error);
      showToast('同步失敗，請稍後再試');
    },
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // 自動更新邏輯 (初次進入 或 快取過期)
  useEffect(() => {
    const checkAndRefresh = async () => {
      const expired = await newsService.isCacheExpired();
      const hasNoData = !isNewsLoading && (!news || news.length === 0);
      
      if (expired || hasNoData) {
        if (!refreshMutation.isPending) {
          refreshMutation.mutate();
        }
      }
    };
    
    checkAndRefresh();
  }, []);

  // 滑到底部自動更新
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !refreshMutation.isPending && !isNewsLoading) {
          newsService.isCacheExpired().then(expired => {
            if (expired) refreshMutation.mutate();
          });
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [refreshMutation.isPending, isNewsLoading]);

  const categories = ['All', 'MLB', 'CPBL', 'NPB'];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isThisYear = date.getFullYear() === now.getFullYear();
    
    return date.toLocaleDateString('zh-TW', {
      year: isThisYear ? undefined : 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatLastUpdate = (timestamp: number | null) => {
    if (!timestamp) return '尚未更新';
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return '剛剛更新';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前更新`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} 小時前更新`;
    
    return `${Math.floor(diffInHours / 24)} 天前更新`;
  };

  // 每分鐘重新整理一次 UI 以更新相對時間
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="news-page-container">
      {/* Toast 提示 */}
      {toast && (
        <div className="toast-notification glass">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      <header className="page-header glass">
        <div className="header-title">
          <Newspaper size={32} className="header-icon" />
          <h1>棒球新聞</h1>
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
            <span>{refreshMutation.isPending ? '同步中...' : '刷新新聞'}</span>
          </button>
        </div>
      </header>

      <section className="filter-bar glass">
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

      <div className="news-list">
        {news?.map((item: NewsItem) => (
          <article key={item.id} className="news-item-row glass-hover">
            <div className="item-main-content">
              <div className="item-meta">
                <span className="item-category">{item.category}</span>
                <span className="item-source">{item.source}</span>
                <span className="item-date">{formatDate(item.date)}</span>
              </div>
              <h3 className="item-title">{item.title}</h3>
              <p className="item-excerpt">{item.content}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-link">
                閱讀全文 <ChevronRight size={14} />
              </a>
            </div>
            {item.imageUrl && !item.imageUrl.includes('unsplash') && (
              <div className="item-thumbnail">
                <img src={item.imageUrl} alt="" loading="lazy" />
              </div>
            )}
          </article>
        ))}

        {(isNewsLoading || refreshMutation.isPending) && (
          <div className="loading-indicator">
            <RefreshCw size={24} className="spin" />
            <p>正在同步最新戰報...</p>
          </div>
        )}

        <div ref={loaderRef} style={{ height: '20px' }}></div>
      </div>

      {!isNewsLoading && news?.length === 0 && !refreshMutation.isPending && (
        <div className="empty-state glass">
          <Newspaper size={64} opacity={0.2} />
          <p>目前沒有新聞資料</p>
        </div>
      )}

      <style>{`
        .news-page-container {
          padding: var(--space-lg);
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          position: relative;
        }

        .toast-notification {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 50px;
          background: var(--bg-secondary);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
          font-weight: 800;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-lg);
          border-radius: 16px;
        }

        .header-title h1 {
          font-size: 1.5rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .header-icon { color: var(--accent-primary); }

        .update-info {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .btn-refresh.loading svg { animation: spin 1s linear infinite; }

        .filter-bar {
          padding: var(--space-sm) var(--space-md);
          border-radius: 12px;
        }

        .filter-options { display: flex; gap: 8px; }

        .filter-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 700;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .filter-btn.active {
          background: var(--accent-primary);
          color: white;
        }

        .news-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .news-item-row {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-lg);
          border-radius: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .news-item-row:hover {
          border-color: var(--accent-primary);
          transform: translateX(4px);
        }

        .item-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .item-category {
          color: white;
          background: var(--text-muted);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .item-source { color: var(--accent-primary); }
        .item-date { color: var(--text-muted); }

        .item-title {
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .item-excerpt {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-blue);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .item-thumbnail {
          width: 120px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-xl);
          color: var(--text-muted);
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @media (max-width: 600px) {
          .item-thumbnail { display: none; }
          .header-actions .update-info { display: none; }
        }
      `}</style>
    </div>
  );
};
