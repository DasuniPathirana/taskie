'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Trash2, List, LayoutGrid, Search, Filter } from 'lucide-react';
import AssigneeSelect from './AssigneeSelect';
import StatusSelect from './StatusSelect';
import SubmitButton from './SubmitButton';
import TaskModal from './TaskModal';
import { handleUpdateTaskStatus, handleDeleteTask, handleAssignTask, handleUpdateTaskStatusForm, handleToggleSubtask, handleDeleteSubtask, handleAddSubtask } from '@/app/actions';

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
  subtasks?: any[];
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
  const [view, setView] = useState<'kanban' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Keep selectedTask in sync with server updates (e.g., when a comment is added)
  React.useEffect(() => {
    if (selectedTask) {
      const updatedTask = tasks.find(t => t.id === selectedTask.id);
      if (updatedTask && updatedTask !== selectedTask) {
        // Deep compare or just trust the new reference depending on how Next.js passes props.
        // Actually, since tasks is a new array from the server action, reference check is fine.
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks]);

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
                        <div onClick={() => setSelectedTask(task as any)} style={{ cursor: 'pointer' }}>
                          <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>{task.title}</h4>
                          {task.description && (
                             <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
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
                            {/* Comments indicator */}
                            {(task as any).comments && (task as any).comments.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 600 }}>{(task as any).comments.length}</span> comments
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <form action={handleAssignTask.bind(null, task.id, projectId)}>
                            <AssigneeSelect defaultValue={task.assigneeId || ''} members={members} />
                          </form>
                        </div>
                        
                        <div className="flex-between" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                          <form action={handleDeleteTask.bind(null, task.id, projectId)} onSubmit={(e) => {
                            if (!window.confirm('Are you sure you want to delete this task?')) e.preventDefault();
                          }}>
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
                      <div onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', display: 'inline-block' }}>
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</div>}
                      </div>
                      
                      {/* Nested Subtasks */}
                      <InlineSubtasks task={task} projectId={projectId} />
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <form action={handleDeleteTask.bind(null, task.id, projectId)} onSubmit={(e) => {
                          if (!window.confirm('Are you sure you want to delete this task?')) e.preventDefault();
                        }}>
                          <SubmitButton variant="icon" style={{ color: 'var(--danger)', padding: '8px', borderRadius: '4px', background: 'var(--bg-base)' }}>
                            <Trash2 size={16} />
                          </SubmitButton>
                        </form>
                        <button onClick={() => setSelectedTask(task as any)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          projectId={projectId} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}

// Inline component for rendering subtasks within the list view
function InlineSubtasks({ task, projectId }: { task: Task, projectId: string }) {
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskDescription, setSubtaskDescription] = useState('');
  
  return (
    <div style={{ marginTop: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--border-color)' }}>
      {task.subtasks && task.subtasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
          {task.subtasks.map((subtask: any) => (
            <div key={subtask.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem' }}>
              <input 
                type="checkbox" 
                checked={subtask.isCompleted} 
                onChange={() => handleToggleSubtask(subtask.id, projectId, !subtask.isCompleted)}
                style={{ width: '14px', height: '14px', marginTop: '3px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 500, textDecoration: subtask.isCompleted ? 'line-through' : 'none', color: subtask.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                  {subtask.title}
                </span>
                {subtask.description && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: subtask.isCompleted ? 'line-through' : 'none' }}>
                    {subtask.description}
                  </span>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete this subtask?')) {
                    handleDeleteSubtask(subtask.id, projectId);
                  }
                }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.5 }}
                onMouseOver={e => e.currentTarget.style.opacity = '1'} 
                onMouseOut={e => e.currentTarget.style.opacity = '0.5'}
                title="Delete subtask"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form action={async () => {
        await handleAddSubtask(task.id, projectId, subtaskTitle, subtaskDescription);
        setSubtaskTitle('');
        setSubtaskDescription('');
      }} style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
        <input 
          type="text" 
          value={subtaskTitle}
          onChange={e => setSubtaskTitle(e.target.value)}
          placeholder="Add subtask..." 
          className="input-field" 
          style={{ padding: '4px 8px', fontSize: '0.875rem', height: '28px' }}
        />
        {subtaskTitle && (
          <input 
            type="text" 
            value={subtaskDescription}
            onChange={e => setSubtaskDescription(e.target.value)}
            placeholder="Description (optional)" 
            className="input-field" 
            style={{ padding: '4px 8px', fontSize: '0.75rem', height: '24px' }}
          />
        )}
        {subtaskTitle && (
           <SubmitButton variant="primary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', alignSelf: 'flex-start', marginTop: '2px', height: '24px' }}>
             Add
           </SubmitButton>
        )}
      </form>
    </div>
  );
}
