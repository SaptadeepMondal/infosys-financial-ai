import React from 'react';

export const Loader = ({ size = 'md', text = 'Processing Multi-Agent Pipeline...' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-[3px]',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fadeIn" role="status">
      <div className="relative">
        <div
          className={`${sizes[size]} rounded-full border-white/10 border-t-brand-400 border-r-accent-400/70 animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-ping" />
        </div>
        <div className="absolute -inset-6 rounded-full bg-brand-500/15 blur-2xl pointer-events-none" />
      </div>
      {text && (
        <p className="text-xs text-slate-400 font-medium tracking-wide text-center max-w-xs">{text}</p>
      )}
    </div>
  );
};
