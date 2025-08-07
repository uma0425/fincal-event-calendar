import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  console.log('お気に入りGET APIが呼び出されました');
  
  try {
    // 現在は匿名ユーザーとして扱う
    const userId = 'anonymous'
    console.log('ユーザーID:', userId);

    // お気に入りイベントを取得
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId
      },
      include: {
        event: true
      }
    })

    console.log('取得したお気に入り数:', favorites.length);
    console.log('お気に入り詳細:', favorites);

    return NextResponse.json({
      success: true,
      favorites: favorites
    })
  } catch (error) {
    console.error('お気に入り取得エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'お気に入りの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('お気に入りPOST APIが呼び出されました');
  
  try {
    const body = await request.json()
    const { eventId } = body
    console.log('リクエストボディ:', body);

    if (!eventId) {
      console.error('eventIdが提供されていません');
      return NextResponse.json(
        { success: false, error: 'eventIdが必要です' },
        { status: 400 }
      )
    }

    // 現在は匿名ユーザーとして扱う
    const userId = 'anonymous'
    console.log('ユーザーID:', userId, 'イベントID:', eventId);

    // 既存のお気に入りをチェック
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        eventId: eventId
      }
    })

    if (existingFavorite) {
      console.log('既にお気に入りに追加されています');
      return NextResponse.json(
        { success: false, error: '既にお気に入りに追加されています' },
        { status: 409 }
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

    console.log('お気に入り追加完了:', favorite);

    return NextResponse.json({
      success: true,
      favorite: favorite
    })
  } catch (error) {
    console.error('お気に入り追加エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'お気に入りの追加に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('お気に入りDELETE APIが呼び出されました');
  
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    console.log('削除対象イベントID:', eventId);

    if (!eventId) {
      console.error('eventIdが提供されていません');
      return NextResponse.json(
        { success: false, error: 'eventIdが必要です' },
        { status: 400 }
      )
    }

    // 現在は匿名ユーザーとして扱う
    const userId = 'anonymous'
    console.log('ユーザーID:', userId);

    // お気に入りを削除
    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        userId: userId,
        eventId: eventId
      }
    })

    console.log('削除されたお気に入り数:', deletedFavorite.count);

    return NextResponse.json({
      success: true,
      deletedCount: deletedFavorite.count
    })
  } catch (error) {
    console.error('お気に入り削除エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'お気に入りの削除に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 