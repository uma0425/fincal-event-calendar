import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 管理者ページへのアクセスをチェック（ログインページは除外）
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // セッションまたはクッキーで認証状態をチェック
    const isAuthenticated = request.cookies.get('admin-auth')?.value === 'true'
    
    if (!isAuthenticated) {
      // 認証されていない場合はログインページにリダイレクト
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
} 