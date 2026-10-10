'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedCounterProps {
  value: number | string;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedCounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (!isNumeric || !numberRef.current) return;

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: numericValue,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (numberRef.current) {
            const formatted = Number.isInteger(numericValue)
              ? Math.round(obj.val).toString()
              : obj.val.toFixed(1);
            numberRef.current.innerText = `${prefix}${formatted}${suffix}`;
          }
        },
      });
    }, numberRef);

    return () => ctx.revert();
  }, [numericValue, isNumeric, prefix, suffix]);

  if (!isNumeric) {
    return <span className={className}>{prefix}{value}{suffix}</span>;
  }

  return (
    <span ref={numberRef} className={className}>
      {prefix}{value}{suffix}
    </span>
  );
}
