import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/favorites - ユーザーのお気に入り一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDが必要です' },
        { status: 400 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: favorites.map(fav => fav.event)
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { success: false, error: 'お気に入りの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/favorites - お気に入りを追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventId } = body

    if (!userId || !eventId) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDとイベントIDが必要です' },
        { status: 400 }
      )
    }

    // イベントの存在確認
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // 既にお気に入りに追加されているかチェック
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: '既にお気に入りに追加されています' },
        { status: 400 }
      )
    }

    // お気に入りを追加
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        eventId
      },
      include: {
        event: true
      }
    })

    return NextResponse.json({
      success: true,
      data: favorite
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { success: false, error: 'お気に入りの追加に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - お気に入りを削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const eventId = searchParams.get('eventId')

    if (!userId || !eventId) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDとイベントIDが必要です' },
        { status: 400 }
      )
    }

    // お気に入りの存在確認
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    })

    if (!existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'お気に入りが見つかりません' },
        { status: 404 }
      )
    }

    // お気に入りを削除
    await prisma.favorite.delete({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'お気に入りが削除されました'
    })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { success: false, error: 'お気に入りの削除に失敗しました' },
      { status: 500 }
    )
  }
} 