import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'

// 管理者用：イベントステータス更新
export async function PATCH(
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
  }
} 