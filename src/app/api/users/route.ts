import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users - ユーザー一覧を取得（管理者用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            events: true,
            favorites: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/users - 新しいユーザーを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role = 'user' } = body

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスと名前が必要です' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    )
  }
} 