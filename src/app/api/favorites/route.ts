import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Prismaクライアントの初期化をより安全に行う
let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Prismaクライアント初期化エラー:', error)
  prisma = null as any
}

// 匿名ユーザーを取得または作成する関数
async function getOrCreateAnonymousUser() {
  try {
    if (!prisma) {
      throw new Error('Prismaクライアントが利用できません')
    }

    // 既存の匿名ユーザーを検索
    let user = await prisma.user.findFirst({
      where: {
        email: 'anonymous@fincal.local'
      }
    })

    // 匿名ユーザーが存在しない場合は作成
    if (!user) {
      console.log('匿名ユーザーを作成中...');
      user = await prisma.user.create({
        data: {
          email: 'anonymous@fincal.local',
          name: 'Anonymous User',
          role: 'user'
        }
      })
      console.log('匿名ユーザー作成完了:', user.id);
    }

    return user.id
  } catch (error) {
    console.error('匿名ユーザー取得/作成エラー:', error);
    throw error
  }
}

export async function GET(request: NextRequest) {
  console.log('お気に入りGET APIが呼び出されました');
  
  try {
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'データベース接続が利用できません',
          fallback: true
        },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

    // 匿名ユーザーを取得または作成
    const userId = await getOrCreateAnonymousUser()
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
    
    // データベース接続エラーの場合は空の配列を返す
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: true,
        favorites: [],
        fallback: true
      })
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'お気に入りの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

export async function POST(request: NextRequest) {
  console.log('お気に入りPOST APIが呼び出されました');
  
  try {
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'データベース接続が利用できません',
          fallback: true
        },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

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

    // 匿名ユーザーを取得または作成
    const userId = await getOrCreateAnonymousUser()
    console.log('ユーザーID:', userId, 'イベントID:', eventId);

    // イベントが存在するかチェック
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      console.error('指定されたイベントが存在しません:', eventId);
      return NextResponse.json(
        { success: false, error: '指定されたイベントが存在しません' },
        { status: 404 }
      )
    }

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
    
    // データベース接続エラーの場合はフォールバックレスポンス
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: true,
        favorite: { id: 'fallback', eventId, userId: 'anonymous', createdAt: new Date().toISOString() },
        fallback: true
      })
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'お気に入りの追加に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

export async function DELETE(request: NextRequest) {
  console.log('お気に入りDELETE APIが呼び出されました');
  
  try {
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'データベース接続が利用できません',
          fallback: true
        },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

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

    // 匿名ユーザーを取得または作成
    const userId = await getOrCreateAnonymousUser()
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
    
    // データベース接続エラーの場合はフォールバックレスポンス
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        fallback: true
      })
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'お気に入りの削除に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
} 