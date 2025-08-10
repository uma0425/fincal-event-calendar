'use client';

import Image from 'next/image';

interface TitleLogoProps {
  className?: string;
}

export default function TitleLogo({ className = '' }: TitleLogoProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Image
        src="/fincal_title.svg"
        alt="FinCal — みんなでつくる、みんなのイベント表"
        width={800}
        height={450}
        className="w-full max-w-4xl h-auto object-contain"
        priority
      />
    </div>
  );
}
