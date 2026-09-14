import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen">
      {/* Ambient background depth layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.35]" />
        <div className="orb -top-40 left-[12%] h-[420px] w-[420px] bg-brand-600/20 animate-float" />
        <div className="orb top-[35%] right-[-8%] h-[380px] w-[380px] bg-accent-600/16" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#04070F] to-transparent" />
      </div>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div key={location.pathname} className="max-w-[1400px] mx-auto animate-fadeUp">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};
