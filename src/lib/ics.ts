import { createEvent } from 'ics'
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

  // ICSファイルのヘッダーとフッターを手動で作成
  const icsHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FinCal//会計・ファイナンスイベント//JA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FinCal - 会計・ファイナンスイベント',
    'X-WR-CALDESC:会計・ファイナンス系イベントのカレンダー',
    'X-WR-TIMEZONE:Asia/Tokyo'
  ].join('\r\n')

  const icsFooter = 'END:VCALENDAR'

  // イベントを文字列に変換
  const eventStrings = await Promise.all(
    icsEvents.map(event => {
      return new Promise<string>((resolve, reject) => {
        event((error, value) => {
          if (error) {
            reject(error)
          } else {
            resolve(value)
          }
        })
      })
    })
  )

  return [icsHeader, ...eventStrings, icsFooter].join('\r\n')
} 