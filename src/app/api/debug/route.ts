import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    console.log('デバッグAPI呼び出し開始')
    
    // データベース接続チェック
    if (!prisma) {
      console.log('Prismaクライアントが存在しません')
      return NextResponse.json({
        success: false,
        error: 'Prismaクライアントが存在しません',
        databaseConnected: false
      }, { status: 503 })
    }

    // データベース接続テスト
    try {
      await prisma.$connect()
      console.log('データベース接続成功')
    } catch (connectError) {
      console.error('データベース接続エラー:', connectError)
      return NextResponse.json({
        success: false,
        error: 'データベース接続に失敗しました',
        databaseConnected: false,
        connectError: connectError instanceof Error ? connectError.message : 'Unknown error'
      }, { status: 503 })
    }

    // 全イベント数を取得
    const totalEvents = await prisma.event.count()
    console.log('全イベント数:', totalEvents)

    // 公開済みイベント数を取得
    const publishedEvents = await prisma.event.count({
      where: { status: EventStatus.published }
    })
    console.log('公開済みイベント数:', publishedEvents)

    // 承認待ちイベント数を取得
    const pendingEvents = await prisma.event.count({
      where: { status: EventStatus.pending }
    })
    console.log('承認待ちイベント数:', pendingEvents)

    // 最新の5件のイベントを取得
    const recentEvents = await prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    console.log('最新のイベント:', recentEvents)

    // 公開済みイベントの詳細を取得
    const publishedEventDetails = await prisma.event.findMany({
      where: { status: EventStatus.published },
      orderBy: { startAt: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        startAt: true,
        endAt: true,
        type: true,
        organizer: true,
        place: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    console.log('公開済みイベント詳細:', publishedEventDetails)

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      totalEvents,
      publishedEvents,
      pendingEvents,
      recentEvents,
      publishedEventDetails
    })

  } catch (error) {
    console.error('デバッグAPIエラー:', error)
    
    return NextResponse.json({
      success: false,
      error: 'デバッグ情報の取得に失敗しました',
      databaseConnected: false,
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    // データベース接続を閉じる
    if (prisma) {
      await prisma.$disconnect()
    }
  }
} 