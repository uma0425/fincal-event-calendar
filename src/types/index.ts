// 独自の型定義（Prismaに依存しない）
export type EventStatus = 'pending' | 'published' | 'rejected'
export type EventType = 'seminar' | 'webinar' | 'meetup' | 'workshop' | 'other'
export type UserRole = 'user' | 'admin'

export interface Event {
  id: string
  title: string
  startAt: Date
  endAt: Date
  type: EventType
  organizer: string
  place: string
  registerUrl: string
  fee: number | null
  target: string[]
  description?: string
  imageUrl?: string
  prefecture?: string
  status: EventStatus
  createdBy: string
  createdAt: Date
  updatedAt: Date
  maxParticipants?: number
  location?: string
}

export interface CreateEventData {
  title: string
  startAt: string
  endAt: string
  type: EventType
  organizer: string
  place: string
  registerUrl: string
  fee: number | null
  target: string[]
  description?: string
  imageUrl?: string
  prefecture?: string
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: EventStatus
}

export interface CalendarView {
  type: 'month' | 'week' | 'list'
}

export interface EventFilter {
  search?: string
  type?: EventType
  prefecture?: string
  startDate?: string
  endDate?: string
}

export interface User {
  id: string
  email: string
  role?: UserRole
} 