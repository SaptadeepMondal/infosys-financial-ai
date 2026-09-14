import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-white/[0.06] text-slate-300 border-white/10',
    emerald: 'bg-brand-500/12 text-brand-200 border-brand-400/30',
    cyan: 'bg-accent-500/12 text-accent-200 border-accent-400/30',
    amber: 'bg-amber-500/12 text-amber-200 border-amber-400/30',
    rose: 'bg-rose-500/12 text-rose-200 border-rose-400/30',
    purple: 'bg-accent-500/12 text-accent-200 border-accent-400/30',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.07em] leading-none backdrop-blur-sm',
          variants[variant] || variants.default,
          className
        )
      )}
    >
      {children}
    </span>
  );
};
