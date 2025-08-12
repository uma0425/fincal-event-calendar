import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'イベントデータが必要です' },
        { status: 400 }
      );
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const eventData of events) {
      try {
        // 必須フィールドのチェック
        if (!eventData.title || !eventData.startAt || !eventData.organizer) {
          results.push({
            success: false,
            error: '必須フィールドが不足しています',
            data: eventData
          });
          errorCount++;
          continue;
        }

        // 日付の変換
        const startAt = new Date(eventData.startAt);
        const endAt = eventData.endAt ? new Date(eventData.endAt) : null;

        if (isNaN(startAt.getTime())) {
          results.push({
            success: false,
            error: '開始日時の形式が正しくありません',
            data: eventData
          });
          errorCount++;
          continue;
        }

        if (endAt && isNaN(endAt.getTime())) {
          results.push({
            success: false,
            error: '終了日時の形式が正しくありません',
            data: eventData
          });
          errorCount++;
          continue;
        }

        // イベントを作成
        const event = await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description || '',
            startAt: startAt,
            endAt: endAt,
            type: eventData.type || 'other',
            organizer: eventData.organizer,
            place: eventData.place || null,
            registerUrl: eventData.registerUrl || null,
            fee: eventData.fee ? parseInt(eventData.fee) : 0,
            target: eventData.target || null,
            imageUrl: eventData.imageUrl || null,
            prefecture: eventData.prefecture || null,
            maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : null,
            status: 'pending'
          }
        });

        results.push({
          success: true,
          data: event
        });
        successCount++;

      } catch (error) {
        console.error('イベント作成エラー:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : '不明なエラー',
          data: eventData
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
      summary: {
        total: events.length,
        success: successCount,
        error: errorCount
      }
    });

  } catch (error) {
    console.error('一括アップロードエラー:', error);
    return NextResponse.json(
      { error: '一括アップロードに失敗しました' },
      { status: 500 }
    );
  }
}
