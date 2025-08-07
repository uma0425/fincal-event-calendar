import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // セッションまたはクッキーから管理者権限をチェック
    // ここでは簡易的にクッキーをチェック
    const cookies = request.headers.get('cookie')
    
    if (cookies && cookies.includes('admin_session=true')) {
      return NextResponse.json({ isAdmin: true })
    }
    
    return NextResponse.json({ isAdmin: false })
  } catch (error) {
    console.error('管理者権限チェックエラー:', error)
    return NextResponse.json({ isAdmin: false })
  }
} 