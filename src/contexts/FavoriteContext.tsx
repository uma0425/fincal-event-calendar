'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoriteContextType {
  favorites: string[];
  addFavorite: (eventId: string) => void;
  removeFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  toggleFavorite: (eventId: string) => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // サーバーからお気に入りを読み込み
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.favorites) {
            const favoriteIds = data.favorites.map((fav: any) => fav.eventId);
            setFavorites(favoriteIds);
            // ローカルストレージにも保存
            localStorage.setItem('favorites', JSON.stringify(favoriteIds));
          }
        } else {
          // APIが失敗した場合はローカルストレージから読み込み
          const savedFavorites = localStorage.getItem('favorites');
          if (savedFavorites) {
            try {
              setFavorites(JSON.parse(savedFavorites));
            } catch (error) {
              console.error('お気に入りの読み込みエラー:', error);
            }
          }
        }
      } catch (error) {
        console.error('お気に入り取得エラー:', error);
        // エラーの場合はローカルストレージから読み込み
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          try {
            setFavorites(JSON.parse(savedFavorites));
          } catch (localError) {
            console.error('ローカルストレージからの読み込みエラー:', localError);
          }
        }
      }
    };

    fetchFavorites();
  }, []);

  // お気に入りをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (eventId: string) => {
    setFavorites(prev => [...prev, eventId]);
  };

  const removeFavorite = (eventId: string) => {
    setFavorites(prev => prev.filter(id => id !== eventId));
  };

  const isFavorite = (eventId: string) => {
    return favorites.includes(eventId);
  };

  const toggleFavorite = async (eventId: string) => {
    try {
      if (isFavorite(eventId)) {
        // お気に入りから削除
        const response = await fetch(`/api/favorites?eventId=${eventId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          removeFavorite(eventId);
        } else {
          console.error('お気に入り削除エラー:', response.status);
        }
      } else {
        // お気に入りに追加
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId }),
        });
        
        if (response.ok) {
          addFavorite(eventId);
        } else {
          console.error('お気に入り追加エラー:', response.status);
        }
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
    }
  };

  return (
    <FavoriteContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite
    }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
} 