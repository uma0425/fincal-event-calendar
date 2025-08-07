import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { EventStatus, EventType } from '@prisma/client'

// Prismaクライアントの初期化をより安全に行う
let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Prismaクライアント初期化エラー:', error)
  prisma = null as any
}

// 管理者用：イベントステータス更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が利用できません' },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

    const { id } = params
    const body = await request.json()
    const { status } = body

    // ステータスの検証
    if (!status || !Object.values(EventStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: '無効なステータスです' },
        { status: 400 }
      )
    }

    // イベントの存在確認
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // イベントステータスを更新
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: status as EventStatus }
    })

    console.log(`イベントステータス更新: ${id} -> ${status}`)

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: `イベントのステータスを${status === 'published' ? '承認' : '拒否'}しました`
    })

  } catch (error) {
    console.error('イベントステータス更新エラー:', error)
    
    let errorMessage = 'イベントの更新に失敗しました'
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'データベース接続が設定されていません'
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = 'データベース接続エラーが発生しました'
      } else if (error.message.includes('invalid input syntax')) {
        errorMessage = '入力データの形式が正しくありません'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// 管理者用：イベント削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が利用できません' },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

    const { id } = params

    // イベントの存在確認
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // イベントを削除
    await prisma.event.delete({
      where: { id }
    })

    console.log(`イベント削除: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'イベントを削除しました'
    })

  } catch (error) {
    console.error('イベント削除エラー:', error)
    
    let errorMessage = 'イベントの削除に失敗しました'
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'データベース接続が設定されていません'
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = '関連データがあるため削除できません'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// 管理者用：イベント更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が利用できません' },
        { status: 503 }
      )
    }

    // データベース接続テスト
    await prisma.$connect()

    const { id } = params
    const body = await request.json()

    console.log('イベント更新リクエスト:', { id, body })

    // イベントの存在確認
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // 日時を結合してISO文字列に変換（日本時間）
    const startDateTime = new Date(`${body.startDate}T${body.startTime}:00+09:00`)
    const endDateTime = new Date(`${body.endDate}T${body.endTime}:00+09:00`)

    console.log('日時変換:', { startDateTime, endDateTime })

    // イベントデータを更新
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        startAt: startDateTime,
        endAt: endDateTime,
        type: body.type as EventType,
        organizer: body.organizer,
        place: body.place || null,
        registerUrl: body.registerUrl || null,
        fee: parseInt(body.fee) || 0,
        target: body.target || null,
        imageUrl: body.imageUrl || null,
        prefecture: body.prefecture || null,
        status: body.status as EventStatus,
        maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
        location: body.place || null
      }
    })

    console.log(`イベント更新完了: ${id}`)

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'イベントを更新しました'
    })

  } catch (error) {
    console.error('イベント更新エラー:', error)
    
    let errorMessage = 'イベントの更新に失敗しました'
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'データベース接続が設定されていません'
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = 'データベース接続エラーが発生しました'
      } else if (error.message.includes('invalid input syntax')) {
        errorMessage = '入力データの形式が正しくありません'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
} 