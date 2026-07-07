'use client';

import React, { useState } from 'react';
import AssigneeSelect from './AssigneeSelect';
import StatusSelect from './StatusSelect';
import SubmitButton from './SubmitButton';
import { handleUpdateTaskStatus, handleDeleteTask, handleAssignTask, handleUpdateTaskStatusForm } from '@/app/actions';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assigneeId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  estimatedHours: number | null;
  assignee: { name: string } | null;
}

interface Member {
  userId: string;
  user: { name: string };
  role: string;
}

interface TaskBoardProps {
  tasks: Task[];
  members: Member[];
  projectId: string;
}

export default function TaskBoard({ tasks, members, projectId }: TaskBoardProps) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const columns = ['New', 'InProgress', 'Review', 'Done'];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesAssignee = assigneeFilter ? task.assigneeId === assigneeFilter : true;
    
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  return (
    <div>
      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px', height: '40px' }}
          >
            <option value="">All Statuses</option>
            {columns.map(col => (
              <option key={col} value={col}>{col === 'InProgress' ? 'In Progress' : col}</option>
            ))}
          </select>

          <select 
            value={assigneeFilter} 
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px', height: '40px' }}
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>{m.user.name}</option>
            ))}
          </select>
        </div>

        {/* View Toggles */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setView('kanban')}
            className="flex-center"
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              background: view === 'kanban' ? 'var(--bg-surface)' : 'transparent',
              color: view === 'kanban' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: view === 'kanban' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <LayoutGrid size={16} style={{ marginRight: '6px' }} /> Kanban
          </button>
          <button 
            onClick={() => setView('list')}
            className="flex-center"
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              background: view === 'list' ? 'var(--bg-surface)' : 'transparent',
              color: view === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: view === 'list' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <List size={16} style={{ marginRight: '6px' }} /> List
          </button>
        </div>
      </div>

      {/* Board View */}
      {view === 'kanban' ? (
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col);
            
            return (
              <div key={col} style={{ flex: '1', minWidth: '320px', background: 'var(--bg-surface-glass)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontWeight: 600 }}>{col === 'InProgress' ? 'In Progress' : col}</h3>
                  <span className="badge" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>{colTasks.length}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      No tasks here
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div key={task.id} style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>{task.title}</h4>
                        {task.description && (
                           <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{task.description}</p>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {(task.startDate || task.endDate) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              {task.startDate ? new Date(task.startDate).toLocaleDateString() : '?'} - {task.endDate ? new Date(task.endDate).toLocaleDateString() : '?'}
                            </div>
                          )}
                          {task.estimatedHours && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              {task.estimatedHours}h
                            </div>
                          )}
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <form action={handleAssignTask.bind(null, task.id, projectId)}>
                            <AssigneeSelect defaultValue={task.assigneeId || ''} members={members} />
                          </form>
                        </div>
                        
                        <div className="flex-between" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                          <form action={handleDeleteTask.bind(null, task.id, projectId)}>
                            <SubmitButton variant="icon" style={{ color: 'var(--danger)', padding: '4px', borderRadius: '4px' }}>
                              <Trash2 size={16} />
                            </SubmitButton>
                          </form>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {col !== 'New' && (
                              <form action={handleUpdateTaskStatus.bind(null, task.id, columns[columns.indexOf(col) - 1], projectId)}>
                                <SubmitButton variant="ghost" className="badge" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                                  Prev
                                </SubmitButton>
                              </form>
                            )}
                            {col !== 'Done' && (
                              <form action={handleUpdateTaskStatus.bind(null, task.id, columns[columns.indexOf(col) + 1], projectId)}>
                                <SubmitButton variant="ghost" className="badge badge-primary" style={{ border: 'none' }}>
                                  Next
                                </SubmitButton>
                              </form>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.875rem' }}>Title</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.875rem' }}>Assignee</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.875rem' }}>Timeline</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.875rem' }}>Hours</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }} className="list-row-hover">
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</div>}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <form action={handleUpdateTaskStatusForm.bind(null, task.id, projectId)}>
                        <StatusSelect defaultValue={task.status} />
                      </form>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <form action={handleAssignTask.bind(null, task.id, projectId)}>
                        <AssigneeSelect defaultValue={task.assigneeId || ''} members={members} />
                      </form>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {(task.startDate || task.endDate) ? (
                        <span>
                          {task.startDate ? new Date(task.startDate).toLocaleDateString() : '?'} - {task.endDate ? new Date(task.endDate).toLocaleDateString() : '?'}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {task.estimatedHours ? `${task.estimatedHours}h` : '-'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <form action={handleDeleteTask.bind(null, task.id, projectId)}>
                        <SubmitButton variant="icon" style={{ color: 'var(--danger)', padding: '8px', borderRadius: '4px' }}>
                          <Trash2 size={16} />
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
