import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズのチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'ファイルサイズが大きすぎます（5MB以下）' },
        { status: 400 }
      )
    }

    // ファイルタイプのチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '画像ファイルのみアップロード可能です' },
        { status: 400 }
      )
    }

    // Base64エンコードして返す（簡易版）
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('画像アップロードエラー:', error)
    return NextResponse.json(
      { success: false, error: '画像のアップロードに失敗しました' },
      { status: 500 }
    )
  }
} 