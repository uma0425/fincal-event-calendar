'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage?: string;
}

export default function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(selectedImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像最適化関数
  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img');
      
      img.onload = () => {
        // 最大サイズを設定（1920x1080）
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 高品質で描画
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // WebP形式で出力（JPEGフォールバック）
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.8 // 品質80%
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // 画像を最適化
        const optimizedFile = await optimizeImage(file);
        onImageSelect(optimizedFile);
        
        // プレビュー表示
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(optimizedFile);
      } catch (error) {
        console.error('画像最適化エラー:', error);
        // 最適化に失敗した場合は元のファイルを使用
        onImageSelect(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="relative">
            <Image
              src={previewUrl}
              alt="プレビュー"
              width={300}
              height={200}
              className="mx-auto rounded-lg object-cover"
              priority
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewUrl(null);
                onImageSelect(new File([], ''));
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div>
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              クリックまたはドラッグ&ドロップで画像をアップロード
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF (最大5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 