// Service Workerを一時的に無効化
console.log('Service Worker disabled for debugging');

// コメントアウトしてService Workerを無効化
/*
const CACHE_NAME = 'fincal-v2.0.0';
const STATIC_CACHE = 'fincal-static-v2.0.0';
const DYNAMIC_CACHE = 'fincal-dynamic-v2.0.0';

// 静的アセットのキャッシュ
const staticAssets = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/placeholder-image.svg',
  '/offline.html'
];

// 動的アセットのキャッシュ戦略
const dynamicCacheStrategy = {
  images: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7日
    maxItems: 100
  },
  api: {
    maxAge: 5 * 60 * 1000, // 5分
    maxItems: 50
  }
};

// Service Workerのインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Static cache opened');
        return cache.addAll(staticAssets);
      }),
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Dynamic cache opened');
        return cache;
      })
    ])
  );
  self.skipWaiting();
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 新しいService Workerを即座に制御
      self.clients.claim()
    ])
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 静的アセットの処理
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(handleStaticAssets(request));
  }
  // 画像の処理
  else if (request.destination === 'image') {
    event.respondWith(handleImages(request));
  }
  // APIの処理
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPI(request));
  }
  // その他のリクエスト
  else {
    event.respondWith(handleOtherRequests(request));
  }
});

// 静的アセットの処理
async function handleStaticAssets(request) {
  try {
    // まずキャッシュを確認
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // ネットワークから取得
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.url.startsWith('http')) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // オフライン時のフォールバック
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// 画像の処理
async function handleImages(request) {
  try {
    // まずキャッシュを確認
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // ネットワークから取得
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.url.startsWith('http')) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      
      // キャッシュのクリーンアップ
      cleanupCache(DYNAMIC_CACHE, dynamicCacheStrategy.images);
    }
    return networkResponse;
  } catch (error) {
    // プレースホルダー画像を返す
    return caches.match('/placeholder-image.svg');
  }
}

// APIの処理
async function handleAPI(request) {
  try {
    // ネットワークファースト戦略
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.url.startsWith('http')) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      
      // キャッシュのクリーンアップ
      cleanupCache(DYNAMIC_CACHE, dynamicCacheStrategy.api);
    }
    return networkResponse;
  } catch (error) {
    // キャッシュフォールバック
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// その他のリクエストの処理
async function handleOtherRequests(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// キャッシュのクリーンアップ
async function cleanupCache(cacheName, strategy) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // 期限切れのアイテムを削除
  const now = Date.now();
  const expiredKeys = [];
  
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const itemDate = new Date(dateHeader).getTime();
        if (now - itemDate > strategy.maxAge) {
          expiredKeys.push(key);
        }
      }
    }
  }
  
  // 期限切れアイテムを削除
  await Promise.all(expiredKeys.map(key => cache.delete(key)));
  
  // 最大アイテム数を超えた場合、古いものから削除
  const remainingKeys = await cache.keys();
  if (remainingKeys.length > strategy.maxItems) {
    const keysToDelete = remainingKeys.slice(0, remainingKeys.length - strategy.maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しいイベントが投稿されました',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '詳細を見る',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/favicon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('FinCal', options)
  );
});

// 通知クリックの処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
*/ 