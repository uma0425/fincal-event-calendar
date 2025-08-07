import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createEvent } from 'ics'

// Prismaクライアントの初期化をより安全に行う
let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Prismaクライアント初期化エラー:', error)
  prisma = null as any
}

export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が利用できません' },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

    // 公開済みイベントを取得
    const events = await prisma.event.findMany({
      where: {
        status: 'published'
      },
      orderBy: {
        startAt: 'asc'
      }
    })

    console.log('ICS配信用イベント取得:', events.length, '件')

    // ICSイベントに変換
    const icsEvents = events.map(event => {
      const startDate = new Date(event.startAt)
      const endDate = new Date(event.endAt)

      return {
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
        url: event.registerUrl || '',
        categories: [event.type],
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: {
          name: event.organizer,
          email: 'noreply@fincal.local'
        }
      }
    })

    // ICSファイルを生成
    const { error, value } = createEvent(icsEvents)

    if (error) {
      console.error('ICS生成エラー:', error)
      return NextResponse.json(
        { success: false, error: 'ICSファイルの生成に失敗しました' },
        { status: 500 }
      )
    }

    // レスポンスヘッダーを設定
    const response = new NextResponse(value, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="fincal-events.ics"',
        'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
      }
    })

    return response

  } catch (error) {
    console.error('ICS配信エラー:', error)
    return NextResponse.json(
      { success: false, error: 'ICS配信に失敗しました' },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
} 