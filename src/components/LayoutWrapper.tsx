'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Settings, Moon, Sun, LogOut, User, Menu, X, CalendarDays, BarChart, Users, Bell } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { signOut } from 'next-auth/react';
import { handleMarkNotificationRead } from '@/app/actions';

export default function LayoutWrapper({ children, user, initialNotifications = [] }: { children: React.ReactNode, user?: any, initialNotifications?: any[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync server-side notifications with local state
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Don't show sidebar/topbar on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return <div className="app-container">{children}</div>;
  }

  const navItems = user?.role === 'Admin' 
    ? [
        { name: 'Admin Hub', href: '/admin', icon: LayoutDashboard },
        { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'My Work', href: '/my-work', icon: CalendarDays },
        { name: 'Projects', href: '/projects', icon: CheckSquare },
        { name: 'Analytics', href: '/analytics', icon: BarChart },
        { name: 'Team', href: '/team', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="app-container animate-fade-in">
      <div 
        className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex-between" style={{ padding: '0 24px', marginBottom: '32px' }}>
          <div className="sidebar-logo" style={{ padding: 0, margin: 0 }}>
            <div className="flex-center" style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, color: '#fff' }}>
              <CheckSquare size={20} />
            </div>
            Taskie
          </div>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
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
          <div className="flex-center" style={{ gap: '12px' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
          <div className="flex-center" style={{ gap: '16px' }}>
            <button onClick={toggleTheme} className="flex-center" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user && (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className="flex-center" 
                  style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{ 
                    position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '320px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 60, padding: '12px', maxHeight: '400px', overflowY: 'auto' 
                  }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>Notifications</h3>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>No new notifications</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={async () => {
                              if (!n.isRead) {
                                setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, isRead: true } : notif));
                                await handleMarkNotificationRead(n.id);
                              }
                              setShowNotifications(false);
                              if (n.link) router.push(n.link);
                            }}
                            style={{ padding: '12px', borderRadius: '8px', background: n.isRead ? 'transparent' : 'var(--bg-base)', border: '1px solid', borderColor: n.isRead ? 'transparent' : 'var(--primary-glow)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                          >
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>{n.type}</span>
                            <p style={{ fontSize: '0.875rem', margin: 0, color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
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
