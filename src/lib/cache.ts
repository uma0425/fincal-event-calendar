// キャッシュシステム
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private cache = new Map<string, CacheItem<any>>();

  // データをキャッシュに保存
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // キャッシュからデータを取得
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // TTLチェック
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // キャッシュを削除
  delete(key: string): void {
    this.cache.delete(key);
  }

  // すべてのキャッシュをクリア
  clear(): void {
    this.cache.clear();
  }

  // 期限切れのキャッシュを削除
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // キャッシュサイズを取得
  size(): number {
    return this.cache.size;
  }

  // キャッシュキーが存在するかチェック
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// グローバルキャッシュインスタンス
export const cache = new Cache();

// 定期的にクリーンアップを実行
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 60000); // 1分ごとにクリーンアップ
}

// イベント関連のキャッシュキー
export const CACHE_KEYS = {
  EVENTS: 'events',
  EVENT_DETAIL: (id: string) => `event_${id}`,
  FILTERED_EVENTS: (filters: string) => `filtered_events_${filters}`,
  CATEGORIES: 'categories',
} as const;

// キャッシュ付きのデータ取得関数
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // キャッシュから取得を試行
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // キャッシュにない場合は取得
  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
}

// イベントデータのキャッシュ付き取得
export async function getCachedEvents(): Promise<any[]> {
  return cachedFetch(
    CACHE_KEYS.EVENTS,
    async () => {
      const response = await fetch('/api/events');
      return response.json();
    },
    2 * 60 * 1000 // 2分間キャッシュ
  );
}

// フィルタリングされたイベントのキャッシュ付き取得
export async function getCachedFilteredEvents(filters: any): Promise<any[]> {
  const filterKey = JSON.stringify(filters);
  return cachedFetch(
    CACHE_KEYS.FILTERED_EVENTS(filterKey),
    async () => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      return response.json();
    },
    1 * 60 * 1000 // 1分間キャッシュ
  );
} 