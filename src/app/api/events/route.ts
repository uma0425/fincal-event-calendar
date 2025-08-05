import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus, EventType } from '@prisma/client'

// イベント一覧取得（公開済みのみ）
export async function GET(request: NextRequest) {
  try {
    // データベース接続チェック
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が設定されていません' },
        { status: 503 }
      )
    }

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
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('イベント取得エラー:', error)
    
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
  }
}

// イベント投稿
export async function POST(request: NextRequest) {
  try {
    // データベース接続チェック
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が設定されていません。管理者にお問い合わせください。' },
        { status: 503 }
      )
    }

    const body = await request.json()
    
    console.log('受信したデータ:', body)
    
    // 必須フィールドの検証
    if (!body.title || !body.description || !body.startDate || !body.organizer) {
      return NextResponse.json(
        { success: false, error: '必須フィールドが不足しています' },
        { status: 400 }
      )
    }

    // 日付の検証
    const startDate = new Date(body.startDate + (body.startTime ? `T${body.startTime}:00` : 'T00:00:00'))
    const endDate = new Date(body.endDate || body.startDate + (body.endTime ? `T${body.endTime}:00` : 'T23:59:59'))
    
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { success: false, error: '開始日の形式が正しくありません' },
        { status: 400 }
      )
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: '終了日の形式が正しくありません' },
        { status: 400 }
      )
    }

    // 新しいイベントを作成（createdByフィールドを除外）
    const eventData = {
      title: body.title,
      description: body.description,
      startAt: startDate,
      endAt: endDate,
      organizer: body.organizer,
      place: body.place || null,
      fee: body.fee ? parseInt(body.fee) : 0,
      type: (body.type as EventType) || EventType.other,
      target: body.target || null,
      registerUrl: body.registerUrl || null,
      prefecture: body.prefecture || null,
      maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
      status: EventStatus.pending,
      imageUrl: body.imageUrl || null,
      location: body.place || null
    }

    console.log('作成するイベントデータ:', eventData)

    const newEvent = await prisma.event.create({
      data: eventData
    })

    console.log('作成されたイベント:', newEvent)

    return NextResponse.json({
      success: true,
      data: newEvent
    })
  } catch (error) {
    console.error('イベント投稿エラー:', error)
    
    // より詳細なエラーメッセージを提供
    let errorMessage = 'イベントの投稿に失敗しました'
    
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'データベース接続が設定されていません。管理者にお問い合わせください。'
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = 'データベース接続エラーが発生しました'
      } else if (error.message.includes('invalid input syntax')) {
        errorMessage = '入力データの形式が正しくありません'
      } else if (error.message.includes('connection')) {
        errorMessage = 'データベース接続エラーが発生しました。しばらく時間をおいてから再試行してください。'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
} 