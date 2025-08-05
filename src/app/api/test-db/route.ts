import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const timestamp = new Date().toISOString()
  
  console.log('データベース接続テスト開始...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '設定済み' : '未設定')

  try {
    // Prismaクライアントがnullの場合は早期リターン
    if (!prisma) {
      const errorResponse = {
        success: false,
        error: 'データベース接続が設定されていません',
        timestamp,
        databaseUrl: '未設定',
        environment: process.env.NODE_ENV,
        details: {
          hasDatabaseUrl: false,
          nodeEnv: process.env.NODE_ENV,
          errorType: 'NoDatabaseConnection'
        }
      }
      
      console.log('エラー詳細:', errorResponse)
      
      return NextResponse.json(errorResponse, { status: 503 })
    }

    // データベース接続テスト
    await prisma.$connect()
    console.log('データベース接続成功')

    // イベント数を取得
    const eventCount = await prisma.event.count()
    console.log(`イベント数: ${eventCount}`)

    // 接続を閉じる
    await prisma.$disconnect()
    console.log('データベース接続を閉じました')

    return NextResponse.json({
      success: true,
      message: 'データベース接続テスト成功',
      timestamp,
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定',
      environment: process.env.NODE_ENV,
      details: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        eventCount,
        connectionStatus: 'connected'
      }
    })

  } catch (error) {
    console.error('データベース接続エラー:', error)
    
    let errorMessage = 'データベース接続エラー'
    let errorType = 'UnknownError'
    
    if (error instanceof Error) {
      errorMessage = error.message
      if (error.message.includes('DATABASE_URL')) {
        errorType = 'MissingDatabaseUrl'
      } else if (error.message.includes('connection')) {
        errorType = 'ConnectionError'
      } else if (error.message.includes('authentication')) {
        errorType = 'AuthenticationError'
      }
    }

    const errorResponse = {
      success: false,
      error: errorMessage,
      timestamp,
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定',
      environment: process.env.NODE_ENV,
      details: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        errorType
      }
    }
    
    console.log('エラー詳細:', errorResponse)
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
} 