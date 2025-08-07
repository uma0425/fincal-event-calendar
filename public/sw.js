const CACHE_NAME = 'fincal-v1.0.0';
const urlsToCache = [
  '/',
  '/static/css/app.css',
  '/static/js/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュに存在する場合はキャッシュから返す
        if (response) {
          return response;
        }

        // キャッシュに存在しない場合はネットワークから取得
        return fetch(event.request).then(
          (response) => {
            // 有効なレスポンスでない場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // オフライン時のフォールバック
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しいイベントが投稿されました',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '詳細を見る',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('FinCal', options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 