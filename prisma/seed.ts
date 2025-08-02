import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 データベースにシードデータを投入中...')

  // デフォルトユーザーを作成
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@fincal.com' },
    update: {},
    create: {
      email: 'admin@fincal.com',
      name: '管理者',
      role: 'admin',
    },
  })

  console.log('✅ デフォルトユーザーを作成:', defaultUser.email)

  // サンプルイベントを作成
  const events = [
    {
      title: 'React 最新機能セミナー',
      startAt: new Date('2024-02-15T14:00:00Z'),
      endAt: new Date('2024-02-15T16:00:00Z'),
      type: 'seminar' as const,
      organizer: 'React Japan',
      place: 'オンライン',
      registerUrl: 'https://example.com/react-seminar',
      fee: 0,
      target: ['エンジニア', 'デザイナー'],
      description: 'React 18の最新機能について詳しく解説します。',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      prefecture: '13',
      maxParticipants: 100,
      status: 'published' as const,
      createdBy: defaultUser.id,
    },
    {
      title: 'Next.js ワークショップ',
      startAt: new Date('2024-02-20T10:00:00Z'),
      endAt: new Date('2024-02-20T17:00:00Z'),
      type: 'workshop' as const,
      organizer: 'Next.js Community',
      place: '東京・渋谷',
      registerUrl: 'https://example.com/nextjs-workshop',
      fee: 5000,
      target: ['フロントエンドエンジニア'],
      description: 'Next.js 14を使った実践的なワークショップです。',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      prefecture: '13',
      maxParticipants: 30,
      status: 'published' as const,
      createdBy: defaultUser.id,
    },
    {
      title: 'TypeScript ミートアップ',
      startAt: new Date('2024-02-25T19:00:00Z'),
      endAt: new Date('2024-02-25T21:00:00Z'),
      type: 'meetup' as const,
      organizer: 'TypeScript Tokyo',
      place: '東京・新宿',
      registerUrl: 'https://example.com/typescript-meetup',
      fee: 1000,
      target: ['TypeScript開発者'],
      description: 'TypeScriptの最新情報とベストプラクティスを共有します。',
      imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
      prefecture: '13',
      maxParticipants: 50,
      status: 'published' as const,
      createdBy: defaultUser.id,
    },
    {
      title: 'AI・機械学習ウェビナー',
      startAt: new Date('2024-03-01T15:00:00Z'),
      endAt: new Date('2024-03-01T16:30:00Z'),
      type: 'webinar' as const,
      organizer: 'AI Research Lab',
      place: 'オンライン',
      registerUrl: 'https://example.com/ai-webinar',
      fee: 0,
      target: ['データサイエンティスト', 'AI研究者'],
      description: '最新のAI技術動向について解説します。',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      prefecture: null,
      maxParticipants: 200,
      status: 'published' as const,
      createdBy: defaultUser.id,
    },
    {
      title: 'スタートアップピッチイベント',
      startAt: new Date('2024-03-05T18:00:00Z'),
      endAt: new Date('2024-03-05T20:00:00Z'),
      type: 'other' as const,
      organizer: 'Startup Hub',
      place: '大阪・梅田',
      registerUrl: 'https://example.com/startup-pitch',
      fee: 3000,
      target: ['起業家', '投資家'],
      description: '革新的なスタートアップのピッチイベントです。',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      prefecture: '27',
      maxParticipants: 80,
      status: 'published' as const,
      createdBy: defaultUser.id,
    },
  ]

  for (const eventData of events) {
    const event = await prisma.event.upsert({
      where: { 
        title_startAt: {
          title: eventData.title,
          startAt: eventData.startAt
        }
      },
      update: {},
      create: eventData,
    })
    console.log('✅ イベントを作成:', event.title)
  }

  // サンプルお気に入りを作成
  const sampleFavorites = [
    { userId: defaultUser.id, eventId: (await prisma.event.findFirst({ where: { title: 'React 最新機能セミナー' } }))?.id },
    { userId: defaultUser.id, eventId: (await prisma.event.findFirst({ where: { title: 'Next.js ワークショップ' } }))?.id },
  ]

  for (const favoriteData of sampleFavorites) {
    if (favoriteData.eventId) {
      await prisma.favorite.upsert({
        where: {
          userId_eventId: {
            userId: favoriteData.userId,
            eventId: favoriteData.eventId
          }
        },
        update: {},
        create: {
          userId: favoriteData.userId,
          eventId: favoriteData.eventId
        },
      })
      console.log('✅ お気に入りを作成')
    }
  }

  console.log('🎉 シードデータの投入が完了しました！')
}

main()
  .catch((e) => {
    console.error('❌ シードデータの投入に失敗しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 