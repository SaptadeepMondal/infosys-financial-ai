import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileText,
  User,
  TrendingUp,
  Cpu,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Research Workspace', path: '/workspace', icon: Layers, highlight: true },
    { name: 'Analyst Reports', path: '/reports', icon: FileText },
    { name: 'Profile & API', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile scrim */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#04070F]/70 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[268px] shrink-0 flex flex-col justify-between
          border-r border-white/[0.07] bg-[#080D1B]/80 backdrop-blur-2xl
          transition-transform duration-300 ease-premium
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Ambient accent behind the glass rail */}
        <div className="orb -top-24 -left-16 h-64 w-64 bg-brand-600/25" />
        <div className="orb bottom-10 -left-20 h-56 w-56 bg-accent-600/20" />

        <div className="relative">
          {/* Brand */}
          <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-[0_10px_25px_-12px_rgba(99,102,241,0.9)]">
                <TrendingUp className="w-[18px] h-[18px]" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-50 tracking-tight leading-none">Infosys AI</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.16em] mt-1">
                  Financial Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <p className="eyebrow px-3 mb-3">Multi-Agent System</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group relative flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ease-premium ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-brand-500/22 to-accent-500/10 border border-brand-400/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                      : 'text-slate-400 border border-transparent hover:text-slate-100 hover:bg-white/[0.05]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-brand-300 to-accent-400 shadow-[0_0_14px_2px_rgba(129,140,248,0.6)]" />
                  )}
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                        isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  {item.highlight && (
                    <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider bg-accent-500/15 text-accent-200 border border-accent-400/25 px-1.5 py-0.5 rounded-md">
                      Core
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom: profile */}
        <div className="relative p-4 space-y-3 border-t border-white/[0.06]">


          <div className="flex items-center gap-3 px-1.5 py-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {user?.full_name || 'Analyst'}
              </p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-accent-300" />
                {user?.role || 'Financial Analyst'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
