'use client';

import React from 'react';

interface AssigneeSelectProps {
  defaultValue: string;
  members: { userId: string; user: { name: string } }[];
}

export default function AssigneeSelect({ defaultValue, members }: AssigneeSelectProps) {
  return (
    <select 
      name="assigneeId" 
      defaultValue={defaultValue}
      onChange={(e) => e.target.form?.requestSubmit()}
      className="input-field"
      style={{ padding: '6px 8px', fontSize: '0.75rem', height: 'auto', background: 'var(--bg-base)' }}
    >
      <option value="">Unassigned</option>
      {members.map(m => (
        <option key={m.userId} value={m.userId}>{m.user.name}</option>
      ))}
    </select>
  );
}
