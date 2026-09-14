import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 transition-colors group-focus-within:text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          className={twMerge(
            clsx('field h-11 px-3.5', Icon ? 'pl-10' : '', error ? 'field-error' : ''),
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-300">{error}</p>}
    </div>
  );
};
