'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger' | 'ghost' | 'icon';
}

export default function SubmitButton({ children, icon, variant = 'primary', className, style, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  let baseClass = '';
  if (variant === 'primary') baseClass = 'btn-primary';
  if (variant === 'danger') baseClass = 'badge'; // Fallback to badge style or custom for danger
  
  const defaultStyles = variant === 'icon' || variant === 'ghost' 
    ? { background: 'transparent', border: 'none', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.5 : 1, ...style }
    : { opacity: pending ? 0.7 : 1, cursor: pending ? 'not-allowed' : 'pointer', ...style };

  return (
    <button 
      type="submit" 
      disabled={pending || props.disabled}
      className={`${baseClass} ${className || ''}`}
      style={defaultStyles}
      {...props}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : icon}
      {variant !== 'icon' && children}
    </button>
  );
}
