'use client';

import React, { useState, useTransition } from 'react';
import { X, MessageSquare, Clock, Calendar, Send, CheckSquare, Plus, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { handleAddComment, handleAddSubtask, handleToggleSubtask, handleDeleteSubtask } from '@/app/actions';
import SubmitButton from './SubmitButton';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string; email: string };
}

interface TaskModalProps {
  task: any; // We'll pass the full task object
  onClose: () => void;
  projectId: string;
}

export default function TaskModal({ task, onClose, projectId }: TaskModalProps) {
  const [comment, setComment] = useState('');
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskDescription, setSubtaskDescription] = useState('');
  
  // To handle form submission correctly
  const handleSubmit = async (formData: FormData) => {
    await handleAddComment(task.id, projectId, formData);
    setComment('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '800px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-base)', border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`badge ${task.status === 'Done' ? 'badge-success' : 'badge-primary'}`}>
              {task.status}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{task.id.slice(-6).toUpperCase()}</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', overflow: 'hidden', flex: 1 }}>
          
          {/* Main Content (Left) */}
          <div style={{ padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>{task.title}</h2>
              
              <div className="markdown-content" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                {task.description ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {task.description}
                  </ReactMarkdown>
                ) : (
                  <em style={{ opacity: 0.5 }}>No description provided.</em>
                )}
              </div>
            </div>

            {/* Subtasks Section */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} /> Subtasks
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto', paddingRight: '8px' }}>
                {task.subtasks?.map((subtask: any) => (
                  <div key={subtask.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <input 
                      type="checkbox" 
                      checked={subtask.isCompleted} 
                      onChange={() => handleToggleSubtask(subtask.id, projectId, !subtask.isCompleted)}
                      style={{ width: '16px', height: '16px', marginTop: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, textDecoration: subtask.isCompleted ? 'line-through' : 'none', color: subtask.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                        {subtask.title}
                      </span>
                      {subtask.description && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: subtask.isCompleted ? 'line-through' : 'none' }}>
                          {subtask.description}
                        </span>
                      )}
                    </div>
                    <button onClick={() => {
                      if (window.confirm('Are you sure you want to delete this subtask?')) {
                        handleDeleteSubtask(subtask.id, projectId);
                      }
                    }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7 }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.7'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <form action={async () => {
                await handleAddSubtask(task.id, projectId, subtaskTitle, subtaskDescription);
                setSubtaskTitle('');
                setSubtaskDescription('');
              }} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <input 
                  type="text" 
                  value={subtaskTitle}
                  onChange={e => setSubtaskTitle(e.target.value)}
                  placeholder="Subtask title..." 
                  className="input-field" 
                  style={{ padding: '8px 12px' }}
                  required
                />
                <input 
                  type="text" 
                  value={subtaskDescription}
                  onChange={e => setSubtaskDescription(e.target.value)}
                  placeholder="Description (optional)..." 
                  className="input-field" 
                  style={{ padding: '8px 12px' }}
                />
                <SubmitButton variant="primary" style={{ padding: '8px 16px', borderRadius: '8px', alignSelf: 'flex-end' }}>
                  <Plus size={16} /> Add Subtask
                </SubmitButton>
              </form>
            </div>

            {/* Comments Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: 'auto' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} /> Activity & Comments
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {task.comments && task.comments.length > 0 ? task.comments.map((c: Comment) => (
                  <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                    <div className="flex-center" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 600, flexShrink: 0 }}>
                      {c.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.user.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="markdown-content" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '0 8px 8px 8px' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No activity yet.</div>
                )}
              </div>

              <form action={handleSubmit} style={{ position: 'relative' }}>
                <textarea 
                  name="content"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment... (Markdown supported)"
                  className="input-field"
                  style={{ width: '100%', minHeight: '80px', paddingBottom: '40px', resize: 'vertical' }}
                  required
                />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                  <SubmitButton variant="primary" style={{ padding: '6px 12px', borderRadius: '4px' }}>
                    <Send size={14} style={{ marginRight: '6px' }} /> Comment
                  </SubmitButton>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div style={{ padding: '24px', background: 'var(--bg-surface)', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Assignee</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {task.assignee ? (
                    <>
                      <div className="flex-center" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{task.assignee.name}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Unassigned</span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Timeline</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} />
                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : '?'} - {task.endDate ? new Date(task.endDate).toLocaleDateString() : '?'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Estimate</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <Clock size={14} />
                  {task.estimatedHours ? `${task.estimatedHours}h` : 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
