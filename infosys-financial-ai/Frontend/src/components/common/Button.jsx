import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Unified button system.
 * Variants: primary | secondary | ghost | danger | cyan (violet accent) | icon
 * API unchanged — purely a visual redesign.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center whitespace-nowrap font-semibold tracking-tight rounded-xl select-none transition-all duration-200 ease-premium active:translate-y-px disabled:opacity-45 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:shadow-none';

  const variants = {
    // Strong, unmistakable primary action
    primary:
      'text-white bg-gradient-to-b from-brand-500 to-brand-600 border border-brand-400/40 shadow-[0_10px_30px_-12px_rgba(99,102,241,0.9),inset_0_1px_0_0_rgba(255,255,255,0.18)] hover:from-brand-400 hover:to-brand-500 hover:shadow-[0_16px_38px_-14px_rgba(99,102,241,1),inset_0_1px_0_0_rgba(255,255,255,0.22)]',
    // Glass secondary
    secondary:
      'text-slate-100 bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-white/[0.1] hover:border-brand-300/30',
    ghost:
      'text-slate-300 bg-transparent border border-transparent hover:text-white hover:bg-white/[0.06]',
    danger:
      'text-rose-200 bg-rose-500/12 border border-rose-500/35 hover:bg-rose-500/20 hover:text-rose-100 hover:border-rose-400/60',
    // Violet secondary accent
    cyan:
      'text-white bg-gradient-to-b from-accent-500 to-accent-600 border border-accent-400/40 shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9),inset_0_1px_0_0_rgba(255,255,255,0.18)] hover:from-accent-400 hover:to-accent-500',
    icon:
      'text-slate-400 bg-white/[0.04] border border-white/10 hover:text-white hover:bg-white/[0.09]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-[15px] gap-2.5',
  };

  const mergedClasses = twMerge(
    clsx(baseStyles, variants[variant] || variants.primary, sizes[size], className)
  );

  return (
    <button
      type={type}
      className={mergedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
