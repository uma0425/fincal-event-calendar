import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'

// イベント一覧取得（公開済みのみ）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const prefecture = searchParams.get('prefecture')
    const search = searchParams.get('search')

    const where: any = {
      status: EventStatus.published
    }

    if (type) {
      where.type = type
    }

    if (prefecture) {
      where.prefecture = prefecture
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { organizer: { contains: search, mode: 'insensitive' } }
      ]
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        startAt: 'asc'
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
    console.error('イベント取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// イベント投稿
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 必須フィールドの検証
    if (!body.title || !body.description || !body.startDate || !body.organizer) {
      return NextResponse.json(
        { success: false, error: '必須フィールドが不足しています' },
        { status: 400 }
      )
    }

    // 一時的なユーザーID（後で認証システムと連携）
    const tempUserId = 'temp-user-id'

    // 新しいイベントを作成
    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startAt: new Date(body.startDate + (body.startTime ? `T${body.startTime}:00` : 'T00:00:00')),
        endAt: new Date(body.endDate + (body.endTime ? `T${body.endTime}:00` : 'T23:59:59')),
        organizer: body.organizer,
        place: body.place || null,
        fee: body.fee ? parseInt(body.fee) : 0,
        type: body.type || 'other',
        target: body.target || null,
        registerUrl: body.registerUrl || null,
        prefecture: body.prefecture || null,
        maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
        location: body.location || null,
        status: EventStatus.pending,
        createdBy: tempUserId
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
      data: newEvent
    })
  } catch (error) {
    console.error('イベント投稿エラー:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの投稿に失敗しました' },
      { status: 500 }
    )
  }
} 