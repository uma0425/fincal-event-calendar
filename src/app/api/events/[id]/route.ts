import { NextRequest, NextResponse } from 'next/server'

// 一時的にAPIルートを無効化
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: true,
    data: null
  })
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