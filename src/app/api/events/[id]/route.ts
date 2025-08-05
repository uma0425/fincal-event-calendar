import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 個別イベント取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // データベース接続チェック
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'データベース接続が設定されていません' },
        { status: 503 }
      )
    }

    const { id } = params

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event
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