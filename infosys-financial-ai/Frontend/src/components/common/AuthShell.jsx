import React from 'react';
import { TrendingUp } from 'lucide-react';
import '../../pages/auth.css';

/**
 * Presentation-only shell for the Login / Register pages.
 * One continuous premium light canvas: aurora + grid + financial artwork.
 * Contains no authentication logic.
 */
const BackgroundArt = () => (
  <div className="auth-art" aria-hidden="true">
    <svg className="art-flow" viewBox="0 0 1440 760" preserveAspectRatio="none" fill="none">
      <g stroke="currentColor" strokeWidth="1.4" opacity="0.22">
        <path
          className="art-draw"
          d="M-20 470 C 160 430, 250 300, 400 330 S 640 500, 780 420 S 1010 190, 1180 250 S 1380 200, 1470 150"
        />
        <path
          className="art-draw"
          style={{ animationDelay: '0.5s' }}
          d="M-20 600 C 200 570, 330 620, 470 560 S 720 380, 900 430 S 1200 340, 1470 300"
          opacity="0.6"
        />
      </g>
      <g fill="#6d4aff" opacity="0.28">
        <circle cx="400" cy="330" r="4" />
        <circle cx="780" cy="420" r="4" />
        <circle cx="1180" cy="250" r="4.5" />
        <circle cx="470" cy="560" r="3.5" />
        <circle cx="900" cy="430" r="3.5" />
      </g>
      <g stroke="#2563eb" strokeWidth="1" opacity="0.14">
        <path d="M400 330 L780 420 L1180 250" />
        <path d="M470 560 L900 430 L1180 250" />
      </g>
      <g fill="#2563eb" opacity="0.06">
        <rect x="1160" y="470" width="14" height="90" rx="4" />
        <rect x="1196" y="500" width="14" height="60" rx="4" />
        <rect x="1232" y="440" width="14" height="120" rx="4" />
        <rect x="1268" y="510" width="14" height="50" rx="4" />
      </g>
      <g stroke="#4f46e5" strokeWidth="1.1" opacity="0.14">
        <path d="M560 660 v70 M560 676 h0" />
        <rect x="552" y="676" width="16" height="34" rx="3" />
        <path d="M612 640 v80" />
        <rect x="604" y="658" width="16" height="44" rx="3" />
        <path d="M664 668 v64" />
        <rect x="656" y="682" width="16" height="30" rx="3" />
      </g>
    </svg>

    <svg className="art-donut" viewBox="0 0 320 320" fill="none">
      <circle cx="160" cy="160" r="118" stroke="#6d4aff" strokeWidth="26" opacity="0.1" />
      <circle
        cx="160"
        cy="160"
        r="118"
        stroke="#3b6cf6"
        strokeWidth="26"
        opacity="0.16"
        strokeLinecap="round"
        strokeDasharray="420 741"
        transform="rotate(-90 160 160)"
      />
      <circle cx="160" cy="160" r="70" stroke="#6d4aff" strokeWidth="1" opacity="0.16" />
    </svg>

    <svg className="art-city" viewBox="0 0 1440 300" preserveAspectRatio="none" fill="none">
      <g fill="#4f6bd8" opacity="0.06">
        <rect x="40" y="170" width="58" height="130" />
        <rect x="120" y="120" width="46" height="180" />
        <rect x="190" y="200" width="70" height="100" />
        <rect x="300" y="150" width="52" height="150" />
        <rect x="380" y="215" width="64" height="85" />
        <rect x="470" y="110" width="44" height="190" />
        <rect x="540" y="180" width="72" height="120" />
        <rect x="650" y="140" width="50" height="160" />
        <rect x="730" y="205" width="62" height="95" />
        <rect x="820" y="130" width="48" height="170" />
        <rect x="900" y="190" width="70" height="110" />
        <rect x="1000" y="150" width="54" height="150" />
        <rect x="1090" y="210" width="66" height="90" />
        <rect x="1180" y="120" width="46" height="180" />
        <rect x="1256" y="185" width="74" height="115" />
        <rect x="1356" y="160" width="52" height="140" />
      </g>
    </svg>
  </div>
);

export const AuthShell = ({ children }) => (
  <div className="auth-root">
    <BackgroundArt />

    <header className="auth-topbar">
      <div className="auth-brand auth-reveal">
        <div className="auth-brand-mark">
          <TrendingUp className="w-5 h-5" style={{ color: '#fff' }} />
        </div>
        <div>
          <p className="auth-brand-name">Infosys AI</p>
          <p className="auth-brand-sub">Financial Intelligence</p>
        </div>
      </div>
    </header>

    {children}

    <footer className="auth-pagefoot">
      Infosys Internship · Multi-Agent Financial Research System
    </footer>
  </div>
);

export default AuthShell;
