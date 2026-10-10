'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
}

export default function BentoCard({
  children,
  className = '',
  enableTilt = false,
  ...props
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -2,
      duration: 0.2,
      ease: 'power2.out',
      borderColor: 'rgba(56, 139, 253, 0.4)',
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
      borderColor: '#1E293B',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`workspace-panel bg-[#111827] border border-[#1E293B] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
