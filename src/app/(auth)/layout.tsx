'use client'
import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const MemoizedLogo = memo(function MemoizedLogo({ src, alt, height, width, className }: { src: string; alt: string; height: number; width: number; className?: string; }) {
  return <Image src={src} alt={alt} height={height} width={width} className={className} />;
});

const LogoPatternBackground = memo(function LogoPatternBackground() {
  const logos = Array(20).fill(0); const rows = Array(10).fill(0);
  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-[0.03]">
      <div className="absolute top-0 left-0 flex h-full w-full flex-col items-start justify-start gap-8">
        {rows.map((_, rowIndex) => {
          const isLeftScroll = rowIndex % 2 === 0; const animationClass = isLeftScroll ? 'animate-scroll-left' : 'animate-scroll-right'; const animationDuration = isLeftScroll ? '180s' : '190s';
          return (
            <div key={rowIndex} className="relative flex w-full flex-nowrap">
              <div className={`flex flex-shrink-0 flex-nowrap items-center justify-around gap-8 ${animationClass}`} style={{ animationDuration }}>
                {logos.map((_, logoIndex) => (<MemoizedLogo key={`a-${logoIndex}`} src="/progressjogja-logo.webp" alt="Progress Jogja Background Logo" height={40} width={170} className="h-10 w-auto max-w-none flex-shrink-0" />))}
              </div>
              <div className={`flex flex-shrink-0 flex-nowrap items-center justify-around gap-8 ${animationClass}`} style={{ animationDuration }}>
                {logos.map((_, logoIndex) => (<MemoizedLogo key={`b-${logoIndex}`} src="/progressjogja-logo.webp" alt="Progress Jogja Background Logo" height={40} width={170} className="h-10 w-auto max-w-none flex-shrink-0" />))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-950 relative overflow-hidden">
      <LogoPatternBackground />

      <Link href="/" className="z-10 flex items-center gap-2 px-4 py-2 mb-8 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all">
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {children}

      <style jsx global>{`
        @keyframes scroll-left { 
          from { transform: translateX(0%); } 
          to { transform: translateX(-100%); } 
        } 
        @keyframes scroll-right { 
          from { transform: translateX(-100%); } 
          to { transform: translateX(0%); } 
        } 
        .animate-scroll-left { animation: scroll-left linear infinite; } 
        .animate-scroll-right { animation: scroll-right linear infinite; } 
      `}</style>
    </div>
  );
}