import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Users, UserPlus, Calendar, Clock } from 'lucide-react';
import { handleCreateTask, handleInviteUser } from '@/app/actions';
import { auth } from '@/auth';
import TaskBoard from '@/components/TaskBoard';
import SubmitButton from '@/components/SubmitButton';

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
        include: { 
          assignee: true,
          comments: {
            include: { user: true },
            orderBy: { createdAt: 'asc' }
          }
        }
      }
    }
  });

  if (!project) notFound();

  const isMember = project.members.some(m => m.userId === userId) || session.user.role === 'Admin';
  if (!isMember) redirect('/');

  const currentUserRole = project.members.find(m => m.userId === userId)?.role || 'MEMBER';
  const isOwnerOrAdmin = currentUserRole === 'OWNER' || session.user.role === 'Admin';

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
              <textarea 
                name="description" 
                className="input-field" 
                placeholder="Task description (Markdown supported)..."
                style={{ minHeight: '100px', resize: 'vertical' }}
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
              <SubmitButton variant="primary">
                <Plus size={18} />
                Add Task
              </SubmitButton>
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

      <TaskBoard tasks={project.tasks} members={project.members} projectId={project.id} />
    </div>
  );
}
