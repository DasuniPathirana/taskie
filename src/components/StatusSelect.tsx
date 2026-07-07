'use client';

import React, { useTransition } from 'react';

interface StatusSelectProps {
  defaultValue: string;
}

export default function StatusSelect({ defaultValue }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const columns = ['New', 'InProgress', 'Review', 'Done'];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const form = e.target.form;
    if (form) {
      startTransition(() => {
        form.requestSubmit();
      });
    }
  };

  return (
    <select 
      name="status" 
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={isPending}
      className="input-field"
      style={{ padding: '6px 8px', fontSize: '0.75rem', height: 'auto', background: 'var(--bg-base)', opacity: isPending ? 0.5 : 1, cursor: isPending ? 'wait' : 'pointer' }}
    >
      {columns.map(col => (
        <option key={col} value={col}>{col === 'InProgress' ? 'In Progress' : col}</option>
      ))}
    </select>
  );
}
