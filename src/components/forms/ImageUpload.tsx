'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  onImageUrlChange?: (url: string | null) => void
  currentImageUrl?: string | null
  className?: string
}

export default function ImageUpload({ 
  onImageChange, 
  onImageUrlChange, 
  currentImageUrl, 
  className = '' 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'アップロードに失敗しました')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : '画像のアップロードに失敗しました')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFile = async (file: File) => {
    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    // ファイルサイズの検証（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // プレビュー用のURLを作成
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onImageChange(file)

    // 実際のアップロードを実行
    const uploadedUrl = await uploadImage(file)
    if (uploadedUrl && onImageUrlChange) {
      onImageUrlChange(uploadedUrl)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const removeImage = () => {
    setPreviewUrl(null)
    onImageChange(null)
    if (onImageUrlChange) {
      onImageUrlChange(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        イベント画像
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="プレビュー"
                className="max-h-48 rounded-lg shadow-sm"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={removeImage}
                disabled={uploading}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {uploading ? 'アップロード中...' : '画像をクリックして変更、またはドラッグ&ドロップで新しい画像をアップロード'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {uploading ? 'アップロード中...' : 'クリックして画像を選択、またはドラッグ&ドロップ'}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
            <button
              type="button"
              onClick={openFileDialog}
              disabled={uploading}
              className="btn btn-secondary disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'アップロード中...' : '画像を選択'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 