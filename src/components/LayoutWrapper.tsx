'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Settings, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { signOut } from 'next-auth/react';

export default function LayoutWrapper({ children, user }: { children: React.ReactNode, user?: any }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  // Don't show sidebar/topbar on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return <div className="app-container">{children}</div>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: CheckSquare },
  ];

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

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
            <button onClick={toggleTheme} className="flex-center" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user && (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex-center" 
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  {getInitials(user.name || user.email)}
                </button>

                {showDropdown && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    marginTop: '8px',
                    width: '240px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    padding: '8px',
                    zIndex: 50
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name || 'User'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>
                    
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex-center"
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        gap: '8px', 
                        justifyContent: 'flex-start',
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--danger)', 
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
