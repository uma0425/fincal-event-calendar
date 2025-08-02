import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/[id] - 特定のイベントを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      }
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
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - イベントを更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // イベントの存在確認
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // 更新データを準備
    const updateData: any = {}
    
    if (body.title) updateData.title = body.title
    if (body.startAt) updateData.startAt = new Date(body.startAt)
    if (body.endAt) updateData.endAt = new Date(body.endAt)
    if (body.type) updateData.type = body.type
    if (body.organizer) updateData.organizer = body.organizer
    if (body.place) updateData.place = body.place
    if (body.registerUrl) updateData.registerUrl = body.registerUrl
    if (body.fee !== undefined) updateData.fee = body.fee
    if (body.target) updateData.target = body.target
    if (body.description !== undefined) updateData.description = body.description
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.prefecture !== undefined) updateData.prefecture = body.prefecture
    if (body.maxParticipants !== undefined) updateData.maxParticipants = body.maxParticipants
    if (body.status) updateData.status = body.status

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedEvent
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - イベントを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // イベントの存在確認
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    // イベントを削除
    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'イベントが削除されました'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの削除に失敗しました' },
      { status: 500 }
    )
  }
} 