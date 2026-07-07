'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '40px' }}>
          <div className="flex-center" style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--primary)', color: 'white', marginBottom: '24px', boxShadow: '0 8px 16px -4px var(--primary-glow)' }}>
            <LogIn size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem' }}>Sign in to access your workspaces</p>
        </div>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input input-field"
              placeholder="name@company.com"
              style={{ width: '100%', fontSize: '1rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input input-field"
                placeholder={showPassword ? "Password" : "••••••••"}
                style={{ width: '100%', fontSize: '1rem', letterSpacing: (password && !showPassword) ? '0.2em' : 'normal', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px', fontSize: '1rem', fontWeight: 600, opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
