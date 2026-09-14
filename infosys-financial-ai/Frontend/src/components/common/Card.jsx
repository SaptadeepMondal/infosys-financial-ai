import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Glass surface card — same props/API, premium presentation. */
export const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  hover = false,
  ...props
}) => {
  const baseClasses = 'glass rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-premium';
  const hoverClasses = hover
    ? 'cursor-pointer hover:-translate-y-0.5 hover:border-brand-300/30 hover:shadow-lift'
    : '';

  return (
    <div className={twMerge(clsx(baseClasses, hoverClasses, className))} {...props}>
      {(title || headerAction) && (
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 mb-5 border-b glass-divider">
          <div className="min-w-0">
            {title && (
              <h3 className="font-semibold text-slate-50 text-[15px] leading-tight tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
