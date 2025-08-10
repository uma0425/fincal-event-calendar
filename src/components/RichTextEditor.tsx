'use client'

import { useState, useRef, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // エディタの内容を更新
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  // 内容変更時の処理
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // 書式設定ボタンの処理
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  // ツールバーボタン
  const ToolbarButton = ({ command, icon, title, className = '' }: {
    command: string
    icon: string
    title: string
    className?: string
  }) => (
    <button
      type="button"
      onClick={() => formatText(command)}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${className}`}
    >
      <span dangerouslySetInnerHTML={{ __html: icon }} />
    </button>
  )

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* ツールバー */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <ToolbarButton
          command="bold"
          icon="<strong>B</strong>"
          title="太字"
          className="font-bold"
        />
        <ToolbarButton
          command="italic"
          icon="<em>I</em>"
          title="斜体"
          className="italic"
        />
        <ToolbarButton
          command="underline"
          icon="<u>U</u>"
          title="下線"
          className="underline"
        />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolbarButton
          command="insertUnorderedList"
          icon="• リスト"
          title="箇条書き"
        />
        <ToolbarButton
          command="insertOrderedList"
          icon="1. 番号付きリスト"
          title="番号付きリスト"
        />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolbarButton
          command="createLink"
          icon="🔗"
          title="リンク"
        />
      </div>

      {/* エディタエリア */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[120px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
          isFocused ? 'bg-white' : 'bg-white'
        }`}
        style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
      />
    </div>
  )
}
