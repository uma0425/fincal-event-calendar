import { createEvent, createCalendar } from 'ics'
import { Event } from '@prisma/client'

export async function generateICS(events: Event[]): Promise<string> {
  const icsEvents = events.map((event) => {
    const startDate = new Date(event.startAt)
    const endDate = new Date(event.endAt)

    return createEvent({
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes()
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes()
      ],
      title: event.title,
      description: event.description || undefined,
      location: event.place || undefined,
      url: event.registerUrl || undefined,
      categories: [event.type],
      organizer: {
        name: event.organizer,
        email: 'noreply@fincal.com'
      }
    })
  })

  const calendar = createCalendar({
    name: 'FinCal - 会計・ファイナンスイベント',
    description: '会計・ファイナンス系イベントのカレンダー',
    timezone: 'Asia/Tokyo',
    events: icsEvents
  })

  return new Promise((resolve, reject) => {
    calendar((error, value) => {
      if (error) {
        reject(error)
      } else {
        resolve(value)
      }
    })
  })
} 