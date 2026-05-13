import { db, NewsItem } from './db';

const MOCK_NEWS: Omit<NewsItem, 'id' | 'timestamp'>[] = [
  {
    title: '大谷翔平雙安進帳 幫助道奇擊敗巨人',
    content: '大谷翔平在今天對陣巨人的比賽中表現出色，單場貢獻兩支安打，並有一分打點，最終道奇以 5:2 獲勝。',
    category: 'MLB',
    source: '體育新聞網',
    url: 'https://example.com/news/1',
    imageUrl: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
  },
  {
    title: '中職開幕戰點燃戰火 大巨蛋湧入三萬球迷',
    content: '中華職棒新賽季在台北大巨蛋正式開打，吸引超過三萬名球迷進場觀賽，氣氛熱烈。',
    category: 'CPBL',
    source: '棒球日報',
    url: 'https://example.com/news/2',
    imageUrl: 'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
  },
  {
    title: '佐佐木朗希飆出 160 公里速球 完封對手',
    content: '千葉羅德海洋隊投手佐佐木朗希在昨晚的比賽中再次展現宰制力，整場狂飆速球，送出 12 次三振。',
    category: 'NPB',
    source: '日經體育',
    url: 'https://example.com/news/3',
    imageUrl: 'https://images.unsplash.com/photo-1516731415730-0c6419096c7c?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
  },
  {
    title: '選秀大會即將到來 潛力新秀受矚目',
    content: '今年的大聯盟選秀大會預計將有許多頂尖高中生與大學球員參與，球探們紛紛展開最後階段的考察。',
    category: 'MLB',
    source: '全球棒球雜誌',
    url: 'https://example.com/news/4',
    imageUrl: 'https://images.unsplash.com/photo-1540739414822-5c19d4533b67?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
  },
];

export class NewsService {
  /**
   * 模擬從 API 抓取新聞
   */
  async fetchNewsFromAPI(): Promise<Omit<NewsItem, 'id'>[]> {
    // 模擬網路延遲
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // 在實際應用中，這裡會是 fetch() 呼叫
    return MOCK_NEWS.map(item => ({
      ...item,
      timestamp: Date.now(),
    }));
  }

  /**
   * 刷新並儲存新聞到本地資料庫
   */
  async refreshNews(): Promise<void> {
    try {
      const newsItems = await this.fetchNewsFromAPI();
      
      // 儲存新聞 (使用 put 避免重複，雖然這裡 id 是自動增量)
      // 為了模擬「最新」新聞，我們先清空舊的或者只增加新的
      // 這裡簡單處理：清空舊的並存入新的
      await db.news.clear();
      await db.news.bulkAdd(newsItems as NewsItem[]);
      
      // 更新最後更新時間
      await db.metadata.put({
        key: 'last_news_update',
        value: Date.now(),
      });
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
}

export const newsService = new NewsService();
