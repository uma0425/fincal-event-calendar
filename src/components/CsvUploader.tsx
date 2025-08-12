'use client';

import { useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface CsvEvent {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  type: string;
  organizer: string;
  place: string;
  registerUrl: string;
  fee: string;
  target: string;
  imageUrl: string;
  prefecture: string;
  maxParticipants: string;
}

export default function CsvUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvData, setCsvData] = useState<CsvEvent[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const { showNotification } = useNotification();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showNotification('CSVファイルを選択してください', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCsv = (csvText: string) => {
    try {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const events: CsvEvent[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // CSVの行を解析（カンマ区切り、ダブルクォート対応）
        const values = parseCsvLine(line);
        
        if (values.length >= headers.length) {
          const event: any = {};
          headers.forEach((header, index) => {
            event[header] = values[index]?.replace(/"/g, '').trim() || '';
          });
          
          // 必須フィールドのチェック
          if (event.title && event.startAt) {
            events.push(event as CsvEvent);
          }
        }
      }
      
      setCsvData(events);
      showNotification(`${events.length}件のイベントを読み込みました`, 'success');
    } catch (error) {
      console.error('CSV解析エラー:', error);
      showNotification('CSVファイルの解析に失敗しました', 'error');
    }
  };

  const parseCsvLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const validateEvent = (event: CsvEvent): string[] => {
    const errors: string[] = [];
    
    if (!event.title) errors.push('タイトルは必須です');
    if (!event.startAt) errors.push('開始日時は必須です');
    if (!event.organizer) errors.push('主催者は必須です');
    
    // 日付形式のチェック
    if (event.startAt && !isValidDate(event.startAt)) {
      errors.push('開始日時の形式が正しくありません (YYYY-MM-DD HH:MM)');
    }
    if (event.endAt && !isValidDate(event.endAt)) {
      errors.push('終了日時の形式が正しくありません (YYYY-MM-DD HH:MM)');
    }
    
    // 参加費のチェック
    if (event.fee && isNaN(Number(event.fee))) {
      errors.push('参加費は数値で入力してください');
    }
    
    // 定員のチェック
    if (event.maxParticipants && isNaN(Number(event.maxParticipants))) {
      errors.push('定員は数値で入力してください');
    }
    
    return errors;
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const uploadEvents = async () => {
    if (csvData.length === 0) {
      showNotification('アップロードするデータがありません', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // バリデーション
      const validEvents = [];
      const invalidEvents = [];

      for (let i = 0; i < csvData.length; i++) {
        const event = csvData[i];
        const errors = validateEvent(event);
        
        if (errors.length > 0) {
          invalidEvents.push({ index: i + 1, event, errors });
        } else {
          validEvents.push({
            title: event.title,
            description: event.description,
            startAt: event.startAt,
            endAt: event.endAt,
            type: event.type || 'other',
            organizer: event.organizer,
            place: event.place,
            registerUrl: event.registerUrl,
            fee: event.fee ? parseInt(event.fee) : 0,
            target: event.target,
            imageUrl: event.imageUrl,
            prefecture: event.prefecture,
            maxParticipants: event.maxParticipants ? parseInt(event.maxParticipants) : null,
          });
        }
      }

      if (invalidEvents.length > 0) {
        showNotification(`${invalidEvents.length}件のイベントにエラーがあります`, 'error');
        console.error('バリデーションエラー:', invalidEvents);
        setIsUploading(false);
        return;
      }

      // 一括アップロード
      const response = await fetch('/api/events/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: validEvents }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { summary } = result;
        showNotification(`${summary.success}件のイベントをアップロードしました${summary.error > 0 ? ` (${summary.error}件失敗)` : ''}`, 'success');
        setCsvData([]);
        setPreviewMode(false);
      } else {
        throw new Error(result.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      console.error('一括アップロードエラー:', error);
      showNotification('イベントのアップロードに失敗しました', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,description,startAt,endAt,type,organizer,place,registerUrl,fee,target,imageUrl,prefecture,maxParticipants
"サンプルイベント","イベントの説明","2024-12-25 14:00","2024-12-25 16:00","seminar","主催者名","開催場所","https://example.com/register",0,"対象者","https://example.com/image.jpg","東京都",50`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">CSV一括アップロード</h3>
        <button
          onClick={downloadTemplate}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          テンプレートをダウンロード
        </button>
      </div>

      <div className="space-y-6">
        {/* ファイルアップロード */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer block"
          >
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              CSVファイルを選択
            </p>
            <p className="text-sm text-gray-500">
              またはファイルをドラッグ&ドロップしてください
            </p>
          </label>
        </div>

        {/* アップロード進捗 */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>アップロード中...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* プレビュー */}
        {csvData.length > 0 && !isUploading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">
                読み込み済み: {csvData.length}件
              </h4>
              <div className="space-x-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {previewMode ? 'プレビューを隠す' : 'プレビューを表示'}
                </button>
                <button
                  onClick={uploadEvents}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  一括アップロード
                </button>
              </div>
            </div>

            {previewMode && (
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイトル
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        開始日時
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        主催者
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        参加費
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.map((event, index) => {
                      const errors = validateEvent(event);
                      return (
                        <tr key={index} className={errors.length > 0 ? 'bg-red-50' : ''}>
                          <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">
                            {event.title}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {event.startAt}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 max-w-xs truncate">
                            {event.organizer}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {event.fee ? `¥${event.fee}` : '無料'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
