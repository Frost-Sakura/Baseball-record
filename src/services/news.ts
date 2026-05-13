import { db } from './db';
import type { NewsItem } from './db';

const RSS_2_JSON_API = 'https://api.rss2json.com/v1/api.json';
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&q=80&w=800';

export class NewsService {
  /**
   * 根據分類獲取 Google News RSS 網址
   */
  private getRSSUrl(category: string): string {
    let query = '棒球';
    if (category === 'MLB') query = 'MLB+baseball';
    else if (category === 'CPBL') query = 'CPBL+中職';
    else if (category === 'NPB') query = 'NPB+日職';
    
    return `https://news.google.com/rss/search?q=${query}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
  }

  /**
   * 從 API 抓取新聞
   */
  async fetchNewsFromAPI(category: string): Promise<Omit<NewsItem, 'id'>[]> {
    const rssUrl = this.getRSSUrl(category);
    // 加上 timestamp 避免被快取
    const response = await fetch(`${RSS_2_JSON_API}?rss_url=${encodeURIComponent(rssUrl)}&t=${Date.now()}`);
    
    if (!response.ok) throw new Error(`無法從 ${category} 來源獲取資料`);
    const data = await response.json();
    if (data.status !== 'ok') throw new Error(data.message || '新聞轉換服務異常');

    return data.items.map((item: any) => {
      // 嘗試從標題提取來源 (格式通常為 "標題 - 來源")
      let displayTitle = item.title;
      let displaySource = item.author || '新聞來源';
      
      const sourceMatch = item.title.match(/(.*)\s-\s([^-]*)$/);
      if (sourceMatch) {
        displayTitle = sourceMatch[1].trim();
        displaySource = sourceMatch[2].trim();
      }

      // 移除描述中的 HTML 並限制長度
      const cleanContent = item.description.replace(/<[^>]*>?/gm, '').trim().substring(0, 150) + '...';
      
      return {
        title: displayTitle,
        content: cleanContent,
        category: category as any,
        source: displaySource,
        url: item.link,
        imageUrl: item.enclosure?.link || item.thumbnail || PLACEHOLDER_IMAGE,
        date: item.pubDate,
        timestamp: new Date(item.pubDate).getTime(),
      };
    });
  }

  /**
   * 刷新並儲存新聞到本地資料庫 (全量更新)
   */
  async refreshNews(): Promise<void> {
    console.log('Starting global news refresh...');
    try {
      const categories = ['MLB', 'CPBL', 'NPB'];
      const allNews: Omit<NewsItem, 'id'>[] = [];

      // 改為循序抓取以避免觸發 API 限制
      for (const cat of categories) {
        try {
          const catNews = await this.fetchNewsFromAPI(cat);
          allNews.push(...catNews);
        } catch (e) {
          console.warn(`Failed to fetch ${cat}, skipping...`, e);
        }
      }

      if (allNews.length === 0) {
        throw new Error('未能抓取到任何新聞內容');
      }

      console.log(`Fetched ${allNews.length} news items total.`);
      
      // 使用事務確保資料完整性
      await db.transaction('rw', db.news, db.metadata, async () => {
        await db.news.clear();
        await db.news.bulkAdd(allNews as NewsItem[]);
        await db.metadata.put({
          key: 'last_news_update',
          value: Date.now(),
        });
      });
      
      console.log('Database updated successfully.');
    } catch (error) {
      console.error('Failed to refresh news:', error);
      throw error;
    }
  }

  /**
   * 從本地資料庫獲取新聞
   */
  async getLocalNews(category?: string): Promise<NewsItem[]> {
    if (category && category !== 'All') {
      return db.news.where('category').equals(category).reverse().sortBy('timestamp');
    }
    return db.news.reverse().sortBy('timestamp');
  }

  /**
   * 獲取最後更新時間
   */
  async getLastUpdateTime(): Promise<number | null> {
    const meta = await db.metadata.get('last_news_update');
    return meta ? (meta.value as number) : null;
  }

  /**
   * 檢查快取是否過期 (5 分鐘)
   */
  async isCacheExpired(): Promise<boolean> {
    const lastUpdate = await this.getLastUpdateTime();
    if (!lastUpdate) return true;
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    return now - lastUpdate > FIVE_MINUTES;
  }
}

export const newsService = new NewsService();
