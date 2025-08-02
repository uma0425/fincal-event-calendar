import { MetadataRoute } from 'next'
import { demoEvents } from '@/lib/demoData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://fincal.example.com' // 本番環境のURLに変更してください

  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]

  // イベント詳細ページ
  const eventPages = demoEvents
    .filter(event => event.status === 'published')
    .map(event => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...staticPages, ...eventPages]
} 