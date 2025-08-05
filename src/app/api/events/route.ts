import { NextRequest, NextResponse } from 'next/server'

// メモリ内でイベントを保存（本格的な実装ではデータベースを使用）
let events: any[] = [
  {
    id: '1',
    title: 'Next.js開発者向けセミナー',
    description: 'Next.js 14の新機能について学ぶセミナーです。',
    startAt: '2024-01-15T10:00:00Z',
    endAt: '2024-01-15T12:00:00Z',
    organizer: 'Next.jsコミュニティ',
    place: 'オンライン',
    fee: 0,
    type: 'seminar',
    target: '開発者',
    registerUrl: 'https://example.com',
    status: 'published',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'React Hooks勉強会',
    description: 'React Hooksの実践的な使い方を学ぶ勉強会です。',
    startAt: '2024-01-20T14:00:00Z',
    endAt: '2024-01-20T16:00:00Z',
    organizer: 'React開発者グループ',
    place: '東京',
    fee: 1000,
    type: 'meetup',
    target: 'React開発者',
    registerUrl: 'https://example.com',
    status: 'published',
    createdAt: new Date().toISOString()
  }
]

// イベント一覧取得
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'イベントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// イベント投稿
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 必須フィールドの検証
    if (!body.title || !body.description || !body.startDate || !body.organizer) {
      return NextResponse.json(
        { success: false, error: '必須フィールドが不足しています' },
        { status: 400 }
      )
    }

    // 新しいイベントを作成
    const newEvent = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      startAt: body.startDate + (body.startTime ? `T${body.startTime}:00` : 'T00:00:00'),
      endAt: body.endDate + (body.endTime ? `T${body.endTime}:00` : 'T23:59:59'),
      organizer: body.organizer,
      place: body.place || '未定',
      fee: body.fee ? parseInt(body.fee) : 0,
      type: body.type || 'other',
      target: body.target || '一般',
      registerUrl: body.registerUrl || '',
      status: 'published',
      createdAt: new Date().toISOString()
    }

    events.push(newEvent)

    return NextResponse.json({
      success: true,
      data: newEvent
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'イベントの投稿に失敗しました' },
      { status: 500 }
    )
  }
} 