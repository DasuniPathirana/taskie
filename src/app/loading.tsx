import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-center" style={{ width: '100%', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1.125rem' }}>Loading workspace...</p>
    </div>
  );
}
