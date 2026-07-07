'use client';

import { createProject } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" className="btn-primary" disabled={pending || disabled} style={{ marginTop: '24px', width: '100%' }}>
      {pending || disabled ? 'Creating...' : 'Create Project'}
    </button>
  );
}

import { useState } from 'react';

export default function NewProject() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (formData: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createProject(formData);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" className="flex-center" style={{ width: 'fit-content', gap: '8px', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">New Project</h1>
          <p className="page-subtitle">Set up a new workspace for your tasks.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <form action={handleAction}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
              Project Name *
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              className="input-field" 
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
              Description
            </label>
            <textarea 
              id="description" 
              name="description" 
              rows={4} 
              className="input-field" 
              placeholder="What is this project about?"
              style={{ resize: 'vertical' }}
            />
          </div>

          <SubmitButton disabled={isSubmitting} />
        </form>
      </div>
    </div>
  );
}
