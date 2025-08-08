// エラーハンドリングライブラリ

export interface AppError {
  name: string
  code: string
  message: string
  details?: any
  timestamp: Date
  userFriendly?: boolean
}

export class ValidationError extends Error {
  public errors: string[]
  public field?: string

  constructor(message: string, errors: string[] = [], field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
    this.field = field
  }
}

export class DatabaseError extends Error {
  public code: string
  public details?: any

  constructor(message: string, code: string = 'DATABASE_ERROR', details?: any) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.details = details
  }
}

export class NetworkError extends Error {
  public status?: number
  public url?: string

  constructor(message: string, status?: number, url?: string) {
    super(message)
    this.name = 'NetworkError'
    this.status = status
    this.url = url
  }
}

export class AuthenticationError extends Error {
  public code: string

  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthenticationError'
    this.code = code
  }
}

// エラーコードの定義
export const ERROR_CODES = {
  // バリデーションエラー
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // データベースエラー
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  
  // ネットワークエラー
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  API_ERROR: 'API_ERROR',
  
  // 認証エラー
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // ファイルエラー
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // システムエラー
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// エラーメッセージのマッピング
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: '入力データに問題があります',
  [ERROR_CODES.INVALID_INPUT]: '入力内容が正しくありません',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: '必須項目が入力されていません',
  
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 'データベース接続エラーが発生しました',
  [ERROR_CODES.DATABASE_QUERY_ERROR]: 'データベース処理中にエラーが発生しました',
  [ERROR_CODES.RECORD_NOT_FOUND]: '指定されたデータが見つかりません',
  [ERROR_CODES.DUPLICATE_RECORD]: '既に存在するデータです',
  
  [ERROR_CODES.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [ERROR_CODES.TIMEOUT_ERROR]: 'リクエストがタイムアウトしました',
  [ERROR_CODES.API_ERROR]: 'APIエラーが発生しました',
  
  [ERROR_CODES.AUTHENTICATION_ERROR]: '認証エラーが発生しました',
  [ERROR_CODES.AUTHORIZATION_ERROR]: '権限が不足しています',
  [ERROR_CODES.INVALID_CREDENTIALS]: '認証情報が正しくありません',
  
  [ERROR_CODES.FILE_UPLOAD_ERROR]: 'ファイルアップロード中にエラーが発生しました',
  [ERROR_CODES.FILE_TOO_LARGE]: 'ファイルサイズが大きすぎます',
  [ERROR_CODES.INVALID_FILE_TYPE]: '対応していないファイル形式です',
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'サーバー内部エラーが発生しました',
  [ERROR_CODES.UNKNOWN_ERROR]: '予期しないエラーが発生しました'
} as const

// エラーをユーザーフレンドリーなメッセージに変換
export function getUserFriendlyMessage(error: Error | AppError): string {
  // AppErrorの場合
  if (isAppError(error)) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message
  }

  // 既知のエラータイプの場合
  if (error instanceof ValidationError) {
    return '入力データに問題があります。内容を確認してください。'
  }

  if (error instanceof DatabaseError) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || 'データベースエラーが発生しました'
  }

  if (error instanceof NetworkError) {
    if (error.status === 404) {
      return 'リクエストされたリソースが見つかりません'
    }
    if (error.status === 500) {
      return 'サーバーエラーが発生しました'
    }
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
  }

  if (error instanceof AuthenticationError) {
    return '認証エラーが発生しました。再度ログインしてください。'
  }

  // 一般的なエラーパターンの検出
  const errorMessage = error.message.toLowerCase()
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
  }
  
  if (errorMessage.includes('timeout')) {
    return 'リクエストがタイムアウトしました。しばらく時間をおいてから再試行してください。'
  }
  
  if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
    return 'データベースエラーが発生しました。しばらく時間をおいてから再試行してください。'
  }
  
  if (errorMessage.includes('validation')) {
    return '入力データに問題があります。内容を確認してください。'
  }

  // デフォルトメッセージ
  return '予期しないエラーが発生しました。しばらく時間をおいてから再試行してください。'
}

// エラーログの記録
export function logError(error: Error | AppError, context?: any): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    name: 'name' in error ? error.name : 'UnknownError',
    message: error.message,
    stack: 'stack' in error ? error.stack : undefined,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }

  // 開発環境ではコンソールに出力
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog)
  }

  // 本番環境では外部ログサービスに送信（例: Sentry, LogRocket等）
  // ここでは簡易的にlocalStorageに保存
  if (typeof window !== 'undefined') {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]')
      existingLogs.push(errorLog)
      // 最新の100件のみ保持
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs))
    } catch (e) {
      console.error('Failed to save error log:', e)
    }
  }
}

// APIレスポンスのエラーハンドリング
export async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let errorMessage = 'APIエラーが発生しました'
    let errorCode = ERROR_CODES.API_ERROR

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
      errorCode = errorData.code || errorCode
    } catch {
      // JSONパースに失敗した場合
      switch (response.status) {
        case 400:
          errorMessage = 'リクエストが正しくありません'
          errorCode = ERROR_CODES.API_ERROR
          break
        case 401:
          errorMessage = '認証が必要です'
          errorCode = ERROR_CODES.API_ERROR
          break
        case 403:
          errorMessage = 'アクセスが拒否されました'
          errorCode = ERROR_CODES.API_ERROR
          break
        case 404:
          errorMessage = 'リソースが見つかりません'
          errorCode = ERROR_CODES.API_ERROR
          break
        case 500:
          errorMessage = 'サーバーエラーが発生しました'
          errorCode = ERROR_CODES.API_ERROR
          break
        default:
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const error = new NetworkError(errorMessage, response.status, response.url)
    logError(error, { status: response.status, url: response.url })
    throw error
  }

  return response.json()
}

// 非同期処理のエラーハンドリング
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error as Error, { context, args })
      throw error
    }
  }
}

// フォーム送信のエラーハンドリング
export function handleFormError(error: Error, formName?: string): string {
  const userMessage = getUserFriendlyMessage(error)
  
  // フォーム固有のエラーハンドリング
  if (formName) {
    logError(error, { formName })
  }
  
  return userMessage
}

// グローバルエラーハンドラー
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return

  // 未処理のPromiseエラー
  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(event.reason), { type: 'unhandledrejection' })
    event.preventDefault()
  })

  // 未処理のJavaScriptエラー
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), { 
      type: 'error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
}

// エラー回復の試行
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }

      // ネットワークエラーやタイムアウトエラーの場合のみリトライ
      if (error instanceof NetworkError || 
          error.message.includes('network') || 
          error.message.includes('timeout')) {
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        continue
      }

      // その他のエラーは即座にスロー
      throw error
    }
  }

  throw lastError!
}

// 型ガード関数
export function isAppError(error: Error | AppError): error is AppError {
  return 'code' in error && typeof error.code === 'string'
}

export function isError(error: Error | AppError): error is Error {
  return 'name' in error && 'stack' in error
} 