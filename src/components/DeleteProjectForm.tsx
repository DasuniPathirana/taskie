'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProject } from '@/app/actions';

export default function DeleteProjectForm({ projectId }: { projectId: string }) {
  return (
    <form action={deleteProject.bind(null, projectId)} onSubmit={(e) => {
      if (!window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
        e.preventDefault();
      }
    }}>
      <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Workspace">
        <Trash2 size={18} />
      </button>
    </form>
  );
}
