import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEvent } from 'ics'

export async function GET(request: NextRequest) {
  try {
    // Prismaクライアントがnullの場合は早期リターン
    if (!prisma) {
      return new NextResponse('データベース接続が設定されていません', { 
        status: 503,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const prefecture = searchParams.get('prefecture')

    const where: any = {
      status: 'published'
    }

    if (type) {
      where.type = type
    }

    if (prefecture) {
      where.prefecture = prefecture
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        startAt: 'asc'
      }
    })

    if (events.length === 0) {
      return new NextResponse('イベントが見つかりません', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
    }

    // ICSファイルのヘッダー
    const icsHeader = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FinCal//Event Calendar//JA',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n')

    // ICSファイルのフッター
    const icsFooter = 'END:VCALENDAR'

    // イベントをICS形式に変換
    const icsEvents = await Promise.all(
      events.map(async (event) => {
        const startDate = new Date(event.startAt)
        const endDate = new Date(event.endAt)

        const icsEvent = await createEvent({
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
          description: event.description || '',
          location: event.place || '',
          organizer: { name: event.organizer },
          url: event.registerUrl || '',
          status: 'CONFIRMED',
          busyStatus: 'BUSY',
          categories: [event.type]
        })

        return icsEvent.value
      })
    )

    // ICSファイルを組み立て
    const icsContent = [
      icsHeader,
      ...icsEvents,
      icsFooter
    ].join('\r\n')

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="events.ics"',
      },
    })

  } catch (error) {
    console.error('ICS生成エラー:', error)
    
    return new NextResponse('カレンダーファイルの生成に失敗しました', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      }
    })
  }
} 