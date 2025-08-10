// 入力検証ライブラリ
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

// 基本的な検証関数
export function validateField(value: any, rules: ValidationRule, fieldName: string): ValidationResult {
  const errors: string[] = []

  // 必須チェック
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${fieldName}は必須です`)
    return { isValid: false, errors }
  }

  // 空の場合は他の検証をスキップ
  if (!value || value.toString().trim() === '') {
    return { isValid: true, errors: [] }
  }

  const stringValue = value.toString().trim()

  // 最小長チェック
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`${fieldName}は${rules.minLength}文字以上である必要があります`)
  }

  // 最大長チェック
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${fieldName}は${rules.maxLength}文字以下である必要があります`)
  }

  // パターンチェック
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(`${fieldName}の形式が正しくありません`)
  }

  // カスタム検証
  if (rules.custom) {
    const customResult = rules.custom(value)
    if (typeof customResult === 'string') {
      errors.push(customResult)
    } else if (!customResult) {
      errors.push(`${fieldName}の値が無効です`)
    }
  }

  return { isValid: errors.length === 0, errors }
}

// XSS対策: HTMLエスケープ
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// XSS対策: 危険なタグを除去
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// URL検証
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// メールアドレス検証
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 日付検証
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// 時刻検証
export function isValidTime(timeString: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeString)
}

// 数値検証
export function isValidNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

// ファイル検証
export function isValidFile(file: File, maxSize: number, allowedTypes: string[]): ValidationResult {
  const errors: string[] = []

  // ファイルサイズチェック
  if (file.size > maxSize) {
    errors.push(`ファイルサイズは${Math.round(maxSize / 1024 / 1024)}MB以下である必要があります`)
  }

  // ファイルタイプチェック
  if (!allowedTypes.includes(file.type)) {
    errors.push(`対応していないファイル形式です。許可されている形式: ${allowedTypes.join(', ')}`)
  }

  return { isValid: errors.length === 0, errors }
}

// イベントデータ検証
export interface EventValidationData {
  title: string
  description: string
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  organizer: string
  place?: string
  fee?: string
  type: string
  target?: string
  registerUrl?: string
  prefecture?: string
  maxParticipants?: string
  imageUrl?: string
}

export function validateEventData(data: EventValidationData): ValidationResult {
  const errors: string[] = []

  // タイトル検証
  const titleResult = validateField(data.title, {
    required: true,
    minLength: 1,
    maxLength: 100
  }, 'イベントタイトル')
  errors.push(...titleResult.errors)

  // 説明検証
  const descriptionResult = validateField(data.description, {
    required: true,
    minLength: 10,
    maxLength: 5000
  }, 'イベント説明')
  errors.push(...descriptionResult.errors)

  // 開始日検証
  if (!isValidDate(data.startDate)) {
    errors.push('開始日が正しくありません')
  }

  // 開始時刻検証
  if (data.startTime && !isValidTime(data.startTime)) {
    errors.push('開始時刻が正しくありません')
  }

  // 終了日検証
  if (data.endDate) {
    if (!isValidDate(data.endDate)) {
      errors.push('終了日が正しくありません')
    } else {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      if (endDate < startDate) {
        errors.push('終了日は開始日以降である必要があります')
      }
    }
  }

  // 終了時刻検証
  if (data.endTime && !isValidTime(data.endTime)) {
    errors.push('終了時刻が正しくありません')
  }

  // 同じ日の場合は時刻チェック
  if (data.startDate === data.endDate && data.startTime && data.endTime) {
    if (data.startTime >= data.endTime) {
      errors.push('同じ日の場合は、終了時刻は開始時刻より後である必要があります')
    }
  }

  // 主催者検証
  const organizerResult = validateField(data.organizer, {
    required: true,
    minLength: 1,
    maxLength: 100
  }, '主催者')
  errors.push(...organizerResult.errors)

  // 参加費検証
  if (data.fee) {
    if (!isValidNumber(data.fee, 0, 1000000)) {
      errors.push('参加費は0円以上1,000,000円以下である必要があります')
    }
  }

  // 最大参加者数検証
  if (data.maxParticipants) {
    if (!isValidNumber(data.maxParticipants, 1, 10000)) {
      errors.push('最大参加者数は1人以上10,000人以下である必要があります')
    }
  }

  // 申込URL検証
  if (data.registerUrl && !isValidUrl(data.registerUrl)) {
    errors.push('申込URLが正しくありません')
  }

  // 画像URL検証
  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    errors.push('画像URLが正しくありません')
  }

  // イベントタイプ検証
  const validTypes = ['seminar', 'webinar', 'meetup', 'workshop', 'other']
  if (!validTypes.includes(data.type)) {
    errors.push('イベントタイプが正しくありません')
  }

  return { isValid: errors.length === 0, errors }
}

// 管理者ログイン検証
export function validateAdminLogin(password: string): ValidationResult {
  const errors: string[] = []

  if (!password || password.trim() === '') {
    errors.push('パスワードは必須です')
  } else if (password.length < 6) {
    errors.push('パスワードは6文字以上である必要があります')
  }

  return { isValid: errors.length === 0, errors }
}

// 検索クエリ検証
export function validateSearchQuery(query: string): ValidationResult {
  const errors: string[] = []

  if (query.length > 100) {
    errors.push('検索クエリは100文字以下である必要があります')
  }

  // 危険な文字列をチェック
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      errors.push('検索クエリに無効な文字が含まれています')
      break
    }
  }

  return { isValid: errors.length === 0, errors }
}

// エラーメッセージの統一
export const VALIDATION_MESSAGES = {
  REQUIRED: 'この項目は必須です',
  INVALID_FORMAT: '形式が正しくありません',
  TOO_SHORT: '文字数が不足しています',
  TOO_LONG: '文字数が多すぎます',
  INVALID_URL: 'URLが正しくありません',
  INVALID_EMAIL: 'メールアドレスが正しくありません',
  INVALID_DATE: '日付が正しくありません',
  INVALID_TIME: '時刻が正しくありません',
  INVALID_NUMBER: '数値が正しくありません',
  FILE_TOO_LARGE: 'ファイルサイズが大きすぎます',
  INVALID_FILE_TYPE: '対応していないファイル形式です',
  XSS_DETECTED: '無効な文字が含まれています'
} as const 