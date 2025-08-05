import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // データベース接続テスト
    await prisma.$connect()
    
    // 簡単なクエリテスト
    const eventCount = await prisma.event.count()
    
    return NextResponse.json({
      success: true,
      message: 'データベース接続成功',
      eventCount,
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定'
    })
  } catch (error) {
    console.error('データベース接続エラー:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 