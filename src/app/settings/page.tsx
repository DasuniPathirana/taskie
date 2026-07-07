import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Settings as SettingsIcon, User, Shield, Bell } from 'lucide-react';
import SubmitButton from '@/components/SubmitButton';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences and personal details.</p>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Settings Nav */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="list-row-hover active" style={{ padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: '1px solid var(--primary)' }}>
              <User size={18} color="var(--primary)" />
              <span style={{ fontWeight: 500, color: 'var(--primary)' }}>Profile Profile</span>
            </div>
            <div className="list-row-hover" style={{ padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <Shield size={18} color="var(--text-secondary)" />
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Security</span>
            </div>
            <div className="list-row-hover" style={{ padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <Bell size={18} color="var(--text-secondary)" />
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Notifications</span>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} /> Personal Information
          </h2>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
              <div className="flex-center" style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700, fontSize: '2rem' }}>
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem', marginBottom: '8px' }}>Change Avatar</button>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>JPG, GIF or PNG. Max size of 800K</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                <input type="text" className="input-field" defaultValue={session.user.name || ''} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                <input type="email" className="input-field" defaultValue={session.user.email || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Role</label>
              <input type="text" className="input-field" defaultValue={session.user.role || 'Member'} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
              <SubmitButton type="button">Save Changes</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
