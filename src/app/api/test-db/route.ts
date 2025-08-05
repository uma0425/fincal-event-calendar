import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // データベース接続テスト
    console.log('データベース接続テスト開始...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '設定済み' : '未設定')
    
    await prisma.$connect()
    console.log('Prisma接続成功')
    
    // 簡単なクエリテスト
    const eventCount = await prisma.event.count()
    console.log('イベント数:', eventCount)
    
    // データベース情報を取得
    const dbInfo = {
      success: true,
      message: 'データベース接続成功',
      eventCount,
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定',
      environment: process.env.NODE_ENV || 'production',
      prismaVersion: require('@prisma/client/package.json').version
    }
    
    console.log('データベース情報:', dbInfo)
    
    return NextResponse.json(dbInfo)
  } catch (error) {
    console.error('データベース接続エラー:', error)
    
    const errorInfo = {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定',
      environment: process.env.NODE_ENV || 'production',
      details: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    }
    
    console.error('エラー詳細:', errorInfo)
    
    return NextResponse.json(errorInfo, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 