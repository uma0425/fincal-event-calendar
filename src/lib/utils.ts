import { EventType } from '@prisma/client'

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    seminar: 'セミナー',
    webinar: 'ウェビナー',
    meetup: 'ミートアップ',
    workshop: 'ワークショップ',
    other: 'その他',
  }
  return labels[type]
}

export function getEventTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    seminar: 'bg-blue-100 text-blue-800',
    webinar: 'bg-green-100 text-green-800',
    meetup: 'bg-purple-100 text-purple-800',
    workshop: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[type]
}

export function formatFee(fee: number | null): string {
  if (!fee) return '無料'
  return `¥${fee.toLocaleString()}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
} 