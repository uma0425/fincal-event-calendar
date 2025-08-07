'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Service Workerの登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // PWAインストールプロンプトの処理
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // PWAがインストールされた時の処理
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      console.log('PWA was installed');
    };

    // 既にインストールされているかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // インストールボタンが表示されない場合は何も表示しない
  if (!showInstallButton || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              FinCalをインストール
            </p>
            <p className="text-xs text-gray-500">
              ホーム画面に追加して、より快適にご利用ください
            </p>
          </div>
          <div className="flex-shrink-0 space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              インストール
            </button>
            <button
              onClick={() => setShowInstallButton(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 