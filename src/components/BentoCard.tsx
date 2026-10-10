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
      y: -3,
      duration: 0.25,
      ease: 'power2.out',
      boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.03)',
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
      boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bento-card bg-white dark:bg-[#131A29] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
