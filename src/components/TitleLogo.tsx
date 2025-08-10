'use client';

interface TitleLogoProps {
  className?: string;
}

export default function TitleLogo({ className = '' }: TitleLogoProps) {
  return (
    <div className={`text-center ${className}`}>
      {/* メインタイトル（一行） */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 animate-fade-in-up">
        <span className="inline-block transform hover:scale-105 transition-transform duration-300">
          FinCal — みんなでつくる、みんなのイベント表
        </span>
      </h1>
      
      {/* 装飾的なアクセント */}
      <div className="flex justify-center items-center mt-4 space-x-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <div className="w-3 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        <div className="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
    </div>
  );
}
