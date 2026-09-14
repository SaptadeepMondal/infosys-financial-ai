import React from 'react';

export const Footer = () => {
  return (
    <footer className="h-11 shrink-0 border-t border-white/[0.06] bg-[#070B16]/60 backdrop-blur-xl flex items-center justify-between gap-4 px-4 sm:px-6 text-[10px] sm:text-[11px] text-slate-500">
      <span className="truncate tracking-wide">
        Infosys · Multi-Agent Financial Research System
      </span>
      <div className="hidden sm:flex items-center gap-4 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          Strict source grounding
        </span>
        <span>Latency 18ms</span>
      </div>
    </footer>
  );
};
