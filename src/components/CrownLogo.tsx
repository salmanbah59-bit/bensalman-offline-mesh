import React from 'react';

interface CrownLogoProps {
  size?: number;
  showGlow?: boolean;
  className?: string;
}

export const CrownLogo: React.FC<CrownLogoProps> = ({
  size = 56,
  showGlow = true,
  className = '',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-[#121212] border border-[#D4AF37] ${
        showGlow ? 'shadow-[0_0_20px_rgba(212,175,55,0.35)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B0" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA820A" />
          </linearGradient>
          <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#D4AF37" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Crown on top */}
        <path
          d="M26 40 L34 22 L50 32 L66 22 L74 40 Z"
          fill="url(#goldGrad)"
          stroke="#AA820A"
          strokeWidth="1.5"
          filter="url(#goldGlowFilter)"
        />

        {/* Jewels on Crown Peaks */}
        <circle cx="34" cy="21" r="2.5" fill="#FFF8DC" />
        <circle cx="50" cy="31" r="3" fill="#FFF8DC" />
        <circle cx="66" cy="21" r="2.5" fill="#FFF8DC" />

        {/* Letter B */}
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fill="url(#goldGrad)"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="900"
          fontSize="42"
          letterSpacing="-1"
          filter="url(#goldGlowFilter)"
        >
          B
        </text>
      </svg>
    </div>
  );
};
