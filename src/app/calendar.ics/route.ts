import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateICS } from '@/lib/ics'
import { EventStatus } from '@prisma/client'

export async function GET() {
  try {
    // 公開済みのイベントのみを取得
    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.published
      },
      orderBy: {
        startAt: 'asc'
      }
    })

    // ICSファイルを生成
    const icsContent = await generateICS(events)

    // レスポンスヘッダーを設定
    const response = new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="fincal-events.ics"',
        'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
      }
    })

    return response
  } catch (error) {
    console.error('ICS生成エラー:', error)
    return NextResponse.json(
      { error: 'カレンダーファイルの生成に失敗しました' },
      { status: 500 }
    )
  }
} 