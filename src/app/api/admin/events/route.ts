import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { EventStatus } from '@prisma/client'

// Prismaクライアントの初期化をより安全に行う
let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Prismaクライアント初期化エラー:', error)
  prisma = null as any
}

// 管理者用イベント一覧取得
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    console.log('管理者イベント取得リクエスト:', { status })

    const where: any = {}

    // ステータスフィルター
    if (status && status !== 'all') {
      where.status = status as EventStatus
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('取得したイベント数:', events.length)

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('管理者イベント取得エラー:', error)
    
    let errorMessage = 'イベントの取得に失敗しました'
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'データベース接続が設定されていません'
      } else if (error.message.includes('connection')) {
        errorMessage = 'データベース接続エラーが発生しました'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// 管理者用：イベントステータス更新
export async function PATCH(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が利用できません' },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

    const body = await request.json()
    const { eventId, status } = body

    console.log('イベントステータス更新リクエスト:', { eventId, status })

    if (!eventId || !status) {
      return NextResponse.json(
        { success: false, error: 'イベントIDとステータスが必要です' },
        { status: 400 }
      )
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: status as EventStatus },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log('イベントステータス更新完了:', { eventId, status })

    return NextResponse.json({
      success: true,
      data: updatedEvent
    })
  } catch (error) {
    console.error('イベントステータス更新エラー:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの更新に失敗しました' },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
} 