'use client';

interface TitleLogoProps {
  className?: string;
}

export default function TitleLogo({ className = '' }: TitleLogoProps) {
  return (
    <div className={`text-center ${className}`}>
      {/* メインタイトル */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-fade-in-up">
        <span className="inline-block transform hover:scale-105 transition-transform duration-300">
          FinCal
        </span>
      </h1>
      
      {/* サブタイトル */}
      <div className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <span className="inline-block bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          みんなでつくる、みんなのイベント表
        </span>
      </div>
      
      {/* 装飾的なアクセント */}
      <div className="flex justify-center items-center mt-6 space-x-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <div className="w-4 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
    </div>
  );
}
