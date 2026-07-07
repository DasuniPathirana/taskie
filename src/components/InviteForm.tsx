'use client';

import { useState, useTransition } from 'react';
import { UserPlus } from 'lucide-react';
import { handleInviteUser } from '@/app/actions';
import SubmitButton from './SubmitButton';

export default function InviteForm({ projectId }: { projectId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    
    try {
      const result = await handleInviteUser(projectId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="email" 
          name="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="input-field" 
          placeholder="Invite by email..."
          style={{ padding: '8px 12px', flex: 1 }}
        />
        <SubmitButton variant="primary" style={{ padding: '8px 12px' }}>
          <UserPlus size={16} />
        </SubmitButton>
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 500 }}>{error}</div>}
      {success && <div style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 500 }}>User invited successfully!</div>}
    </form>
  );
}
