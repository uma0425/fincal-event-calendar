import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events - イベント一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // フィルタ条件を構築
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }

    // デフォルトでは公開済みのイベントのみを取得
    if (!status) {
      where.status = 'published'
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      },
      orderBy: {
        startAt: 'asc'
      },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      data: events,
      total: events.length
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/events - 新しいイベントを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // バリデーション
    const requiredFields = ['title', 'startAt', 'endAt', 'type', 'organizer', 'place', 'registerUrl', 'target']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field}は必須です` },
          { status: 400 }
        )
      }
    }

    // 一時的にデフォルトユーザーIDを使用（後で認証システムを実装）
    const defaultUserId = 'default-user-id'

    const event = await prisma.event.create({
      data: {
        title: body.title,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        type: body.type,
        organizer: body.organizer,
        place: body.place,
        registerUrl: body.registerUrl,
        fee: body.fee || null,
        target: body.target,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        prefecture: body.prefecture || null,
        maxParticipants: body.maxParticipants || null,
        status: 'pending', // デフォルトは承認待ち
        createdBy: defaultUserId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: event
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの作成に失敗しました' },
      { status: 500 }
    )
  }
} 