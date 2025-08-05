const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('データベースにサンプルデータを追加中...')

  // サンプルイベントデータ
  const sampleEvents = [
    {
      title: 'FinTech セミナー 2024',
      description: '最新のFinTechトレンドについて学ぶセミナーです。AI、ブロックチェーン、デジタルバンキングなど、金融業界の最新技術について詳しく解説します。',
      startAt: new Date('2024-12-15T10:00:00Z'),
      endAt: new Date('2024-12-15T12:00:00Z'),
      type: 'seminar',
      organizer: 'FinTech協会',
      place: '東京国際フォーラム',
      registerUrl: 'https://example.com/fintech-seminar',
      fee: 0,
      target: 'FinTech関係者、金融業界従事者',
      imageUrl: null,
      prefecture: '東京都',
      status: 'published',
      maxParticipants: 100,
      location: '東京国際フォーラム'
    },
    {
      title: 'ブロックチェーン技術ワークショップ',
      description: 'ブロックチェーン技術の基礎から応用まで実践的に学べます。ハンズオン形式で、実際にスマートコントラクトを作成します。',
      startAt: new Date('2024-12-20T14:00:00Z'),
      endAt: new Date('2024-12-20T17:00:00Z'),
      type: 'workshop',
      organizer: 'ブロックチェーン研究所',
      place: '大阪ビジネスパーク',
      registerUrl: 'https://example.com/blockchain-workshop',
      fee: 5000,
      target: '開発者、エンジニア',
      imageUrl: null,
      prefecture: '大阪府',
      status: 'published',
      maxParticipants: 30,
      location: '大阪ビジネスパーク'
    },
    {
      title: 'AI・機械学習ミートアップ',
      description: 'AI・機械学習に興味のある方々が集まるミートアップです。最新の研究動向や実務での活用事例について情報交換を行います。',
      startAt: new Date('2024-12-25T19:00:00Z'),
      endAt: new Date('2024-12-25T21:00:00Z'),
      type: 'meetup',
      organizer: 'AIコミュニティ',
      place: '渋谷スクランブルスクエア',
      registerUrl: 'https://example.com/ai-meetup',
      fee: 1000,
      target: 'AI研究者、データサイエンティスト',
      imageUrl: null,
      prefecture: '東京都',
      status: 'published',
      maxParticipants: 50,
      location: '渋谷スクランブルスクエア'
    },
    {
      title: 'ウェビナー：デジタル変革の最新動向',
      description: '企業のデジタル変革について、成功事例と失敗事例を交えて詳しく解説します。オンラインで参加可能です。',
      startAt: new Date('2024-12-30T15:00:00Z'),
      endAt: new Date('2024-12-30T16:30:00Z'),
      type: 'webinar',
      organizer: 'デジタル変革コンサルティング',
      place: 'オンライン',
      registerUrl: 'https://example.com/dx-webinar',
      fee: 0,
      target: '経営者、IT担当者',
      imageUrl: null,
      prefecture: null,
      status: 'published',
      maxParticipants: 200,
      location: 'オンライン'
    },
    {
      title: 'スタートアップピッチイベント',
      description: '注目のスタートアップが最新のサービスやプロダクトをピッチします。投資家やメディアも参加予定です。',
      startAt: new Date('2025-01-05T18:00:00Z'),
      endAt: new Date('2025-01-05T20:00:00Z'),
      type: 'seminar',
      organizer: 'スタートアップ支援団体',
      place: '六本木ヒルズ',
      registerUrl: 'https://example.com/startup-pitch',
      fee: 3000,
      target: '起業家、投資家、メディア',
      imageUrl: null,
      prefecture: '東京都',
      status: 'published',
      maxParticipants: 80,
      location: '六本木ヒルズ'
    }
  ]

  try {
    // 既存のイベントを削除（オプション）
    await prisma.event.deleteMany({})
    console.log('既存のイベントを削除しました')

    // サンプルイベントを追加
    for (const eventData of sampleEvents) {
      const event = await prisma.event.create({
        data: eventData
      })
      console.log(`イベントを作成しました: ${event.title}`)
    }

    console.log('✅ サンプルデータの追加が完了しました！')
    
    // 作成されたイベント数を確認
    const eventCount = await prisma.event.count()
    console.log(`📊 データベース内のイベント数: ${eventCount}`)

  } catch (error) {
    console.error('❌ サンプルデータの追加に失敗しました:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 