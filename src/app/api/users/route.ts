import { NextRequest, NextResponse } from 'next/server'

// 一時的にAPIルートを無効化
export async function GET() {
  return NextResponse.json({
    success: true,
    data: []
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'User created successfully'
  })
} 