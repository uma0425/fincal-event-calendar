const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log('データベース初期化開始...')
    
    // データベース接続テスト
    await prisma.$connect()
    console.log('✅ データベース接続成功')
    
    // スキーマをプッシュ
    console.log('スキーマをプッシュ中...')
    const { execSync } = require('child_process')
    execSync('npx prisma db push', { stdio: 'inherit' })
    console.log('✅ スキーマプッシュ完了')
    
    // サンプルデータを作成（オプション）
    console.log('サンプルデータを作成中...')
    
    const sampleEvent = await prisma.event.create({
      data: {
        title: 'FinCal サンプルイベント',
        description: 'これはFinCalアプリケーションのサンプルイベントです。',
        startAt: new Date('2024-12-25T19:00:00Z'),
        endAt: new Date('2024-12-25T22:00:00Z'),
        type: 'seminar',
        organizer: 'FinCal Team',
        place: 'オンライン',
        fee: 0,
        target: '開発者、会計士',
        status: 'published',
        prefecture: '東京都'
      }
    })
    
    console.log('✅ サンプルイベント作成完了:', sampleEvent.id)
    
    // イベント数を確認
    const eventCount = await prisma.event.count()
    console.log(`✅ データベース内のイベント数: ${eventCount}`)
    
    console.log('🎉 データベース初期化完了！')
    
  } catch (error) {
    console.error('❌ データベース初期化エラー:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase() 