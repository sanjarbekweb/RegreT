'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GsapRevealProps {
  children: React.ReactNode;
  stagger?: number;
  duration?: number;
  y?: number;
  className?: string;
  delay?: number;
}

export default function GsapReveal({
  children,
  stagger = 0.06,
  duration = 0.65,
  y = 20,
  className = '',
  delay = 0.05,
}: GsapRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const elements = containerRef.current.children;
    if (!elements || elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          stagger,
          delay,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [stagger, duration, y, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
