import { EventStatus, EventType, UserRole } from '@prisma/client'

export type { EventStatus, EventType, UserRole }

export interface Event {
  id: string
  title: string
  description?: string
  startAt: Date
  endAt: Date
  type: EventType
  organizer: string
  place?: string
  registerUrl?: string
  fee?: number
  target?: string
  imageUrl?: string
  prefecture?: string
  status: EventStatus
  createdBy: string
  createdAt: Date
  updatedAt: Date
  maxParticipants?: number
  location?: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface EventFormData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  organizer: string
  place: string
  fee: string
  type: EventType
  target: string
  registerUrl: string
  prefecture: string
  maxParticipants: string
  location: string
} 