import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus, EventType } from '@prisma/client'
import { validateEventData, sanitizeHtml } from '@/lib/validation'
import { DatabaseError, ValidationError, logError } from '@/lib/errorHandling'

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

    // 画像URLが空の場合はデフォルト画像を設定
    const processedEvents = events.map(event => ({
      ...event,
      imageUrl: event.imageUrl || `https://via.placeholder.com/800x400/2563eb/ffffff?text=${encodeURIComponent(event.title)}`
    }))

    return NextResponse.json({
      success: true,
      events: processedEvents
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
      throw new DatabaseError('データベース接続が設定されていません', 'DATABASE_CONNECTION_ERROR')
    }

    const body = await request.json()
    
    console.log('受信したデータ:', body)
    
    // 入力データのサニタイズ
    const sanitizedBody = {
      ...body,
      title: sanitizeHtml(body.title || ''),
      description: sanitizeHtml(body.description || ''),
      organizer: sanitizeHtml(body.organizer || ''),
      place: body.place ? sanitizeHtml(body.place) : '',
      target: body.target ? sanitizeHtml(body.target) : ''
    }
    
    // 包括的なバリデーション
    const validationResult = validateEventData(sanitizedBody)
    if (!validationResult.isValid) {
      throw new ValidationError('入力データに問題があります', validationResult.errors)
    }

    // 日時を結合してISO文字列に変換（日本時間）
    let startDateTime: Date
    let endDateTime: Date

    // 開始日時の処理
    if (sanitizedBody.startTime) {
      startDateTime = new Date(`${sanitizedBody.startDate}T${sanitizedBody.startTime}:00+09:00`)
    } else {
      // 時刻が指定されていない場合は00:00をデフォルトとする
      startDateTime = new Date(`${sanitizedBody.startDate}T00:00:00+09:00`)
    }

    // 終了日時の処理
    if (sanitizedBody.endDate && sanitizedBody.endTime) {
      endDateTime = new Date(`${sanitizedBody.endDate}T${sanitizedBody.endTime}:00+09:00`)
    } else if (sanitizedBody.endDate && !sanitizedBody.endTime) {
      // 終了日のみ指定されている場合は23:59をデフォルトとする
      endDateTime = new Date(`${sanitizedBody.endDate}T23:59:59+09:00`)
    } else if (!sanitizedBody.endDate && sanitizedBody.endTime) {
      // 終了時刻のみ指定されている場合は開始日を使用
      endDateTime = new Date(`${sanitizedBody.startDate}T${sanitizedBody.endTime}:00+09:00`)
    } else {
      // 終了日時が指定されていない場合は開始日時と同じとする
      endDateTime = new Date(startDateTime)
    }

    // イベントデータを作成
    const eventData = {
      title: sanitizedBody.title,
      description: sanitizedBody.description,
      startAt: startDateTime,
      endAt: endDateTime,
      type: (sanitizedBody.type as EventType) || EventType.other,
      organizer: sanitizedBody.organizer,
      place: sanitizedBody.place || null,
      registerUrl: sanitizedBody.registerUrl || null,
      fee: parseInt(sanitizedBody.fee) || 0,
      target: sanitizedBody.target || null,
      imageUrl: sanitizedBody.imageUrl || null,
      prefecture: sanitizedBody.prefecture || null,
      status: EventStatus.pending,
      maxParticipants: sanitizedBody.maxParticipants ? parseInt(sanitizedBody.maxParticipants) : null,
      location: sanitizedBody.place || null
    }

    console.log('受信した画像URL:', sanitizedBody.imageUrl)
    console.log('保存する画像URL:', eventData.imageUrl)

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
    logError(error as Error, { endpoint: '/api/events', method: 'POST' })
    
    // エラータイプに応じた適切なレスポンス
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { success: false, error: 'データベースエラーが発生しました。しばらく時間をおいてから再試行してください。' },
        { status: 503 }
      )
    }
    
    // その他のエラー
    return NextResponse.json(
      { success: false, error: 'イベントの投稿に失敗しました。しばらく時間をおいてから再試行してください。' },
      { status: 500 }
    )
  }
} 