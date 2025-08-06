import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// お気に入り一覧取得
export async function GET(request: NextRequest) {
  try {
    // データベース接続チェック
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が設定されていません' },
        { status: 503 }
      )
    }

    // セッションからユーザーIDを取得（簡易版）
    // 実際の実装では認証システムを使用
    const userId = 'anonymous' // 仮のユーザーID

    // お気に入りイベントを取得
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId
      },
      include: {
        event: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      favorites: favorites.map(fav => ({
        id: fav.id,
        eventId: fav.eventId,
        userId: fav.userId,
        createdAt: fav.createdAt,
        event: fav.event
      }))
    })

  } catch (error) {
    console.error('お気に入り取得エラー:', error)
    
    return NextResponse.json(
      { success: false, error: 'お気に入りの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// お気に入り追加
export async function POST(request: NextRequest) {
  try {
    // データベース接続チェック
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が設定されていません' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'イベントIDが指定されていません' },
        { status: 400 }
      )
    }

    // セッションからユーザーIDを取得（簡易版）
    const userId = 'anonymous' // 仮のユーザーID

    // 既にお気に入りに追加されているかチェック
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        eventId: eventId
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
        userId: userId,
        eventId: eventId
      },
      include: {
        event: true
      }
    })

    return NextResponse.json({
      success: true,
      favorite: {
        id: favorite.id,
        eventId: favorite.eventId,
        userId: favorite.userId,
        createdAt: favorite.createdAt,
        event: favorite.event
      }
    })

  } catch (error) {
    console.error('お気に入り追加エラー:', error)
    
    return NextResponse.json(
      { success: false, error: 'お気に入りの追加に失敗しました' },
      { status: 500 }
    )
  }
}

// お気に入り削除
export async function DELETE(request: NextRequest) {
  try {
    // データベース接続チェック
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が設定されていません' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'イベントIDが指定されていません' },
        { status: 400 }
      )
    }

    // セッションからユーザーIDを取得（簡易版）
    const userId = 'anonymous' // 仮のユーザーID

    // お気に入りを削除
    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        userId: userId,
        eventId: eventId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'お気に入りから削除しました'
    })

  } catch (error) {
    console.error('お気に入り削除エラー:', error)
    
    return NextResponse.json(
      { success: false, error: 'お気に入りの削除に失敗しました' },
      { status: 500 }
    )
  }
} 