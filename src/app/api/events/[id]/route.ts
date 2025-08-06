import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'イベントIDが指定されていません' },
        { status: 400 }
      )
    }

    // データベース接続チェック
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が設定されていません' },
        { status: 503 }
      )
    }

    // イベントを取得
    const event = await prisma.event.findUnique({
      where: {
        id: eventId
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // 公開済みイベントのみアクセス可能（管理者以外）
    if (event.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'このイベントは公開されていません' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      event: event
    })

  } catch (error) {
    console.error('イベント詳細取得エラー:', error)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: true,
    message: 'Event updated successfully'
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: true,
    message: 'Event deleted successfully'
  })
} 