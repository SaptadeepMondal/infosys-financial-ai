import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileText,
  FileBarChart,
  ShieldAlert,
  User,
  Settings,
  TrendingUp,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Light glassmorphism application shell for the dashboard command center.
 * Presentation only — navigation targets are the app's existing routes.
 */
const BackgroundArt = () => (
  <div className="dash-art" aria-hidden="true">
    <svg className="art-flow" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none">
      <path
        d="M0 470 C 140 430 210 500 320 420 C 430 340 500 400 610 320 C 720 240 800 300 900 210 C 1000 120 1100 170 1200 110"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0 540 C 160 520 240 560 360 490 C 480 420 560 470 680 400 C 800 330 890 380 1000 300 C 1090 236 1140 250 1200 220"
        stroke="#6d4aff"
        strokeOpacity="0.12"
        strokeWidth="2"
        fill="none"
      />
      {[
        [320, 420],
        [610, 320],
        [900, 210],
        [1000, 300],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="currentColor" fillOpacity="0.18" />
      ))}
    </svg>
  </div>
);

const NAV_PRIMARY = [
  { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Research Workspace', to: '/workspace', icon: Layers },
  { name: 'Documents', to: '/documents', icon: FileText },
  { name: 'Reports', to: '/reports', icon: FileBarChart },
  { name: 'Risk Intelligence', to: '/workspace', icon: ShieldAlert },
];

const NAV_SECONDARY = [
  { name: 'Settings', to: '/profile', icon: Settings },
  { name: 'Profile', to: '/profile', icon: User },
];


export const DashShell = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const name = user?.full_name || 'Analyst';
  const initial = name.charAt(0).toUpperCase();

  const ALL_NAV = [...NAV_PRIMARY, ...NAV_SECONDARY];
  const activeName =
    ALL_NAV.find((n) => location.pathname === n.to || location.pathname.startsWith(`${n.to}/`))?.name || '';

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = item.name === activeName;


    return (
      <Link
        key={item.name}
        to={item.to}
        className={`dash-nav-item ${active ? 'is-active' : ''}`}
        onClick={() => setOpen(false)}
      >
        <Icon />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="dash">
      <BackgroundArt />

      {open && <div className="dash-scrim lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside className={`dash-sidebar ${open ? 'is-open' : ''}`}>
        <div>
          <div className="dash-brand">
            <span className="dash-brand-mark">
              <TrendingUp className="w-[18px] h-[18px]" />
            </span>
            <span>
              <span className="dash-brand-name block">Infosys AI</span>
              <span className="dash-brand-sub block">Financial Intelligence</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="dash-icon-btn ml-auto lg:hidden"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="dash-nav">
            <p className="dash-nav-label">Research</p>
            {NAV_PRIMARY.map(renderItem)}
            <div className="dash-nav-divider" />
            {NAV_SECONDARY.map(renderItem)}
          </nav>
        </div>

        <div className="dash-user">
          <span className="dash-avatar">{initial}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-slate-800 truncate">{name}</span>
            <span className="block text-[11px] text-slate-500 truncate">{user?.role || 'Analyst'}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="dash-icon-btn lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <label className="dash-search">
              <Search className="w-4 h-4" />
              <input type="search" placeholder="Search financial research..." aria-label="Search financial research" />
            </label>
          </div>

          <div className="flex items-center gap-2.5">
            <button type="button" className="dash-icon-btn" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="dash-dot" />
            </button>
            <Link to="/profile" className="flex items-center gap-2.5 pl-1">
              <span className="dash-avatar">{initial}</span>
              <span className="hidden sm:block text-[13px] font-semibold text-slate-700">{name}</span>
            </Link>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
};
