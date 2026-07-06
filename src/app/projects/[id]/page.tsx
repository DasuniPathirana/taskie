import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Users, UserPlus, Calendar, Clock } from 'lucide-react';
import { handleCreateTask, handleUpdateTaskStatus, handleDeleteTask, handleInviteUser, handleAssignTask } from '@/app/actions';
import { auth } from '@/auth';
import AssigneeSelect from '@/components/AssigneeSelect';

export const dynamic = 'force-dynamic';

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = session.user.id;
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: { user: true }
      },
      tasks: {
        orderBy: { createdAt: 'desc' },
        include: { assignee: true }
      }
    }
  });

  if (!project) notFound();

  const isMember = project.members.some(m => m.userId === userId) || session.user.role === 'Admin';
  if (!isMember) redirect('/');

  const currentUserRole = project.members.find(m => m.userId === userId)?.role || 'MEMBER';
  const isOwnerOrAdmin = currentUserRole === 'OWNER' || session.user.role === 'Admin';

  const columns = ['New', 'InProgress', 'Review', 'Done'];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" className="flex-center" style={{ width: 'fit-content', gap: '8px', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>

      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start', marginBottom: '8px' }}>
            <h1 className="page-title">{project.name}</h1>
            <span className={`badge ${project.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
              {project.status}
            </span>
          </div>
          <p className="page-subtitle">{project.description || 'No description'}</p>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Left Column: Tasks */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>Add New Task</h3>
          <form action={handleCreateTask.bind(null, project.id)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Task Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  className="input-field" 
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Assignee</label>
                <select name="assigneeId" className="input-field">
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
              <input 
                type="text" 
                name="description" 
                className="input-field" 
                placeholder="Task description (optional)..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Start Date</label>
                <input type="date" name="startDate" className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>End Date</label>
                <input type="date" name="endDate" className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Estimated Hours</label>
                <input type="number" step="0.5" min="0" name="estimatedHours" className="input-field" placeholder="e.g. 5.5" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="btn-primary">
                <Plus size={18} />
                Add Task
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Members */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> Members
            </h3>
            <span className="badge">{project.members.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {project.members.map(member => (
              <div key={member.id} className="flex-between" style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{member.user.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{member.user.email}</div>
                </div>
                <span className={`badge ${member.role === 'OWNER' ? 'badge-primary' : ''}`} style={{ fontSize: '0.75rem' }}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          {isOwnerOrAdmin && (
            <form action={handleInviteUser.bind(null, project.id)} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                name="email" 
                required 
                className="input-field" 
                placeholder="Invite by email..."
                style={{ padding: '8px 12px', flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>
                <UserPlus size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        {columns.map(col => {
          const colTasks = project.tasks.filter(t => t.status === col);
          
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
                        <form action={handleAssignTask.bind(null, task.id, project.id)}>
                          <AssigneeSelect defaultValue={task.assigneeId || ''} members={project.members} />
                        </form>
                      </div>
                      
                      <div className="flex-between" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                        <form action={handleDeleteTask.bind(null, task.id, project.id)}>
                          <button type="submit" style={{ color: 'var(--danger)', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </form>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {col !== 'New' && (
                            <form action={handleUpdateTaskStatus.bind(null, task.id, columns[columns.indexOf(col) - 1], project.id)}>
                              <button type="submit" className="badge" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                                Prev
                              </button>
                            </form>
                          )}
                          {col !== 'Done' && (
                            <form action={handleUpdateTaskStatus.bind(null, task.id, columns[columns.indexOf(col) + 1], project.id)}>
                              <button type="submit" className="badge badge-primary" style={{ cursor: 'pointer', border: 'none' }}>
                                Next
                              </button>
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
    </div>
  );
}
