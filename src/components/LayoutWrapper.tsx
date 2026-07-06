'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: CheckSquare },
  ];

  return (
    <div className="app-container animate-fade-in">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="flex-center" style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, color: '#fff' }}>
            <CheckSquare size={20} />
          </div>
          Taskie
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div></div>
          <div className="flex-center" style={{ gap: '16px' }}>
            <button onClick={toggleTheme} className="flex-center" style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex-center" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 'bold' }}>
              U
            </div>
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
