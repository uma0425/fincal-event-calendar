import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'

// 管理者用：全イベント取得（承認待ち含む）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status as EventStatus
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('管理者イベント取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 管理者用：イベントステータス更新
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, status } = body

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
  }
} 