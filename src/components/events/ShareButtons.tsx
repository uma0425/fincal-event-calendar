'use client'

import { Share2, ExternalLink } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  description: string
  url: string
  registerUrl: string
}

export default function ShareButtons({ title, description, url, registerUrl }: ShareButtonsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      try {
        await navigator.clipboard.writeText(url)
        alert('URLをコピーしました')
      } catch (error) {
        console.error('Copy failed:', error)
        // さらにフォールバック: 手動でコピー
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('URLをコピーしました')
      }
    }
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={handleShare}
        className="btn btn-outline"
      >
        <Share2 className="h-4 w-4 mr-2" />
        共有
      </button>
      
      <a
        href={registerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        申込する
      </a>
    </div>
  )
} 