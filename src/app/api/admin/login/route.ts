import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'パスワードが入力されていません' },
        { status: 400 }
      )
    }

    if (password === ADMIN_PASSWORD) {
      // ログイン成功
      const response = NextResponse.json(
        { success: true, message: 'ログインに成功しました' },
        { status: 200 }
      )

      // 認証クッキーを設定（24時間有効）
      response.cookies.set('admin-auth', 'true', {
        httpOnly: false, // クライアントサイドでもアクセス可能にする
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24時間
        path: '/'
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, error: 'パスワードが正しくありません' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('ログインエラー:', error)
    return NextResponse.json(
      { success: false, error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
} 