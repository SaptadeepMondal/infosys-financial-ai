import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Search, Bell, HelpCircle, LogOut, Menu, TrendingUp,
  BookOpen, LifeBuoy, Keyboard, CheckCheck, FileCheck, ShieldAlert, Bot, X,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ThemeToggle } from '../common/ThemeToggle';

const NOTIFICATIONS = [
  { id: 1, icon: FileCheck, tone: 'text-emerald-400', title: 'Report generation completed', body: 'Your latest research report is ready in Reports.', time: 'Just now', to: '/reports' },
  { id: 2, icon: ShieldAlert, tone: 'text-amber-400', title: 'Risk signal detected', body: 'New red-flag signal raised during document analysis.', time: '12m ago', to: '/dashboard' },
  { id: 3, icon: Bot, tone: 'text-cyan-400', title: 'Agents engine online', body: 'All research agents are operational and indexed.', time: '1h ago', to: '/dashboard' },
];

const HELP_LINKS = [
  { icon: BookOpen, title: 'Getting started', body: 'Create a workspace, upload filings, ask questions.', to: '/dashboard' },
  { icon: Bot, title: 'How the agents work', body: 'Grounded answers with source citations from your documents.', to: '/workspace' },
  { icon: LifeBuoy, title: 'Reports & exports', body: 'Generate and review analyst-ready research reports.', to: '/reports' },
];

const Panel = ({ title, children, onClose, footer }) => (
  <div className="nav-panel absolute right-0 top-[calc(100%+12px)] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#0B1020]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_.15s_ease-out] p-0">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400">{title}</p>
      <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/[0.07]" aria-label="Close">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="max-h-[320px] overflow-y-auto">{children}</div>
    {footer ? <div className="px-4 py-2.5 border-t border-white/10">{footer}</div> : null}
  </div>
);

export const Navbar = ({ onMenuClick = () => {} }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(null); // 'notifications' | 'help' | null
  const [readIds, setReadIds] = useState([]);
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const unread = NOTIFICATIONS.filter((n) => !readIds.includes(n.id));

  return (
    <div className="sticky top-0 z-30 px-3 sm:px-5 pt-3 pb-1">
      <header className="nav-glass h-[60px] px-3 sm:px-4 flex items-center gap-3 sm:gap-4">
        {/* Left: mobile menu + brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.07] transition-colors duration-200"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="nav-mark relative flex items-center justify-center w-8 h-8 rounded-[10px] ring-1 ring-white/15">
              <TrendingUp className="w-[17px] h-[17px] text-white" />
            </span>
            <span className="hidden sm:block leading-none">
              <span className="block font-display text-[15px] font-semibold tracking-[-0.01em] text-slate-50">
                Infosys AI
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 mt-1">
                Financial Intelligence
              </span>
            </span>
          </div>

          <span className="hidden xl:flex items-center gap-2 ml-2 pl-3 border-l border-white/10 text-[11px] text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="font-medium">Multi-Agent Pipeline</span>
          </span>
        </div>

        {/* Center: command search */}
        <div className="flex-1 flex justify-center min-w-0">
          <div className="relative w-full max-w-lg hidden sm:block group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-brand-300" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search companies, filings, metrics or reports…"
              className="field h-9 pl-10 pr-16 text-xs w-full"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-white/10 bg-white/[0.05] text-[10px] font-medium text-slate-400 tracking-wide">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: actions & user */}
        <div ref={wrapRef} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <span className="hidden 2xl:inline-flex items-center h-7 px-2.5 mr-1 rounded-lg border border-white/10 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Infosys Internship Project
          </span>

          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(open === 'notifications' ? null : 'notifications')}
              aria-expanded={open === 'notifications'}
              className={`relative p-2 rounded-lg transition-colors duration-200 ${open === 'notifications' ? 'text-white bg-white/[0.09]' : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'}`}
              title="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unread.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold leading-4 text-center ring-2 ring-[#070B16]">
                  {unread.length}
                </span>
              )}
            </button>

            {open === 'notifications' && (
              <Panel
                title="Notifications"
                onClose={() => setOpen(null)}
                footer={
                  <button
                    onClick={() => setReadIds(NOTIFICATIONS.map((n) => n.id))}
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-brand-300 hover:text-brand-200 py-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
                  </button>
                }
              >
                {NOTIFICATIONS.map((n) => {
                  const Icon = n.icon;
                  const isRead = readIds.includes(n.id);
                  return (
                    <Link
                      key={n.id}
                      to={n.to}
                      onClick={() => {
                        setReadIds((p) => (p.includes(n.id) ? p : [...p, n.id]));
                        setOpen(null);
                      }}
                      className="flex gap-3 px-4 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.04] transition-colors"
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${n.tone}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isRead ? 'text-slate-400' : 'text-slate-100'}`}>{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                      </div>
                    </Link>
                  );
                })}
              </Panel>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(open === 'help' ? null : 'help')}
              aria-expanded={open === 'help'}
              className={`p-2 rounded-lg transition-colors duration-200 ${open === 'help' ? 'text-white bg-white/[0.09]' : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'}`}
              title="Help & documentation"
            >
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>

            {open === 'help' && (
              <Panel
                title="Help & guides"
                onClose={() => setOpen(null)}
                footer={
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Press <kbd className="px-1 rounded border border-white/10 bg-white/[0.05] text-slate-400">⌘K</kbd> to search</span>
                  </div>
                }
              >
                {HELP_LINKS.map((h) => {
                  const Icon = h.icon;
                  return (
                    <Link
                      key={h.title}
                      to={h.to}
                      onClick={() => setOpen(null)}
                      className="flex gap-3 px-4 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.04] transition-colors"
                    >
                      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-brand-300" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-100">{h.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{h.body}</p>
                      </div>
                    </Link>
                  );
                })}
              </Panel>
            )}
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/10 mx-1" />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5">
                <div className="nav-mark w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] ring-1 ring-white/15">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-slate-100 leading-none">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{user.role || 'Analyst'}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          ) : (
            <Badge variant="default">Guest Session</Badge>
          )}
        </div>
      </header>
    </div>
  );
};
