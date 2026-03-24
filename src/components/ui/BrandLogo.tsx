import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'lg';
}

export function BrandLogo({ className = '', size = 'sm' }: BrandLogoProps) {
  const isLg = size === 'lg';
  const iconSize = isLg ? 64 : 40;
  const textSize = isLg ? 'text-3xl' : 'text-base';
  const subTextSize = isLg ? 'text-sm mt-1.5' : 'text-[10px] mt-0.5';
  const radius = isLg ? 'rounded-2xl' : 'rounded-xl';
  const badgeSize = isLg ? 'w-4 h-4 -top-1 -right-1 border-[3px]' : 'w-2.5 h-2.5 -top-0.5 -right-0.5 border-2';

  return (
    <div className={`flex items-center ${isLg ? 'gap-5' : 'gap-3'} pointer-events-auto ${className}`}>
      <div className="relative flex-shrink-0">
        <div 
          className={`overflow-hidden ${radius}`}
          style={{ 
            width: iconSize, 
            height: iconSize,
            boxShadow: isLg 
              ? "0 0 0 2px rgba(59,130,246,0.35), 0 0 24px rgba(59,130,246,0.30)"
              : "0 0 0 1px rgba(59,130,246,0.35), 0 0 16px rgba(59,130,246,0.20)" 
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 40">
            <defs>
              <radialGradient id="lG" cx="38%" cy="32%" r="68%">
                <stop offset="0%"   stopColor="#2563EB"/>
                <stop offset="55%"  stopColor="#1E3A8A"/>
                <stop offset="100%" stopColor="#0A1628"/>
              </radialGradient>
              <filter id="lF" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.9" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <clipPath id="lC"><circle cx="18" cy="21" r="11"/></clipPath>
            </defs>
            <rect width="40" height="40" rx="9" fill="#070F1C"/>
            <circle cx="18" cy="21" r="11" fill="url(#lG)"/>
            <g clipPath="url(#lC)" fill="none" opacity="0.55">
              <ellipse cx="16" cy="17" rx="4.5" ry="3" fill="#16A34A"/>
              <ellipse cx="22" cy="18" rx="3.5" ry="2.5" fill="#15803D"/>
              <ellipse cx="13" cy="22" rx="3" ry="2" fill="#166534"/>
              <ellipse cx="21" cy="24" rx="4" ry="2" fill="#14532D"/>
            </g>
            <ellipse cx="16" cy="15" rx="4" ry="2.5" fill="white" opacity="0.08" transform="rotate(-25 16 15)" clipPath="url(#lC)"/>
            <circle cx="18" cy="21" r="11" fill="none" stroke="#93C5FD" strokeWidth="0.5" opacity="0.4"/>
            <ellipse cx="18" cy="21" rx="14" ry="4.8" fill="none" stroke="#93C5FD" strokeWidth="1.3" opacity="0.75" transform="rotate(-22 18 21)" filter="url(#lF)"/>
            <circle cx="21" cy="16" r="1.1" fill="white" opacity="0.95" filter="url(#lF)"/>
            <line x1="22" y1="15" x2="29" y2="9"  stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" filter="url(#lF)"/>
            <circle cx="30.5" cy="7.5" r="2"   fill="#F59E0B" filter="url(#lF)"/>
            <line x1="22" y1="16" x2="33" y2="15" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" filter="url(#lF)"/>
            <circle cx="34.5" cy="14.5" r="2" fill="#22D3EE" filter="url(#lF)"/>
            <line x1="22" y1="17" x2="29" y2="23" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" filter="url(#lF)"/>
            <circle cx="30.5" cy="24.5" r="2" fill="#4ADE80" filter="url(#lF)"/>
          </svg>
        </div>
        <span className={`absolute rounded-full bg-accent-green border-bg-primary ${badgeSize}`} />
      </div>
      <div>
        <h1 className={`${textSize} font-bold text-text-primary tracking-tight leading-none`}>
          Globe<span className="text-accent-amber">IQ</span>
        </h1>
        <p className={`${subTextSize} text-text-muted tracking-widest uppercase`}>
          World Intelligence
        </p>
      </div>
    </div>
  );
}
