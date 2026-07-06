'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Auto sign in after registration
        const signInRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInRes?.error) {
          setError('Registration successful, but auto-login failed. Please sign in manually.');
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
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
            <UserPlus size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Create an account</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem' }}>Get started with Taskie for free</p>
        </div>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input input-field"
              placeholder="Jane Doe"
              style={{ width: '100%', fontSize: '1rem' }}
            />
          </div>
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
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input input-field"
              placeholder="Create a strong password"
              style={{ width: '100%', fontSize: '1rem', letterSpacing: password ? '0.2em' : 'normal' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px', fontSize: '1rem', fontWeight: 600, opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
