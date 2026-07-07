import { db } from '@/lib/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, Clock, CheckCircle2, Circle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyWork() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = session.user.id;

  const tasks = await db.task.findMany({
    where: { assigneeId: userId },
    include: { project: true },
    orderBy: [
      { status: 'asc' },
      { endDate: 'asc' }
    ]
  });

  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const completedTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Work</h1>
          <p className="page-subtitle">Manage your assigned tasks across all projects.</p>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Circle size={20} color="var(--primary)" /> Active Tasks ({activeTasks.length})
          </h2>
          {activeTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              You have no active tasks.
            </div>
          ) : (
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeTasks.map(task => (
                  <Link href={`/projects/${task.projectId}`} key={task.id} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div className="list-row-hover" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{task.title}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{task.project.name}</div>
                      </div>
                      <div>
                        <span className={`badge ${task.status === 'InProgress' ? 'badge-primary' : 'badge-warning'}`}>
                          {task.status === 'InProgress' ? 'In Progress' : task.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', justifyContent: 'flex-end' }}>
                        {task.endDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarDays size={14} />
                            {new Date(task.endDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.estimatedHours && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} />
                            {task.estimatedHours}h
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
            <CheckCircle2 size={20} color="var(--success)" /> Completed ({completedTasks.length})
          </h2>
          {completedTasks.length > 0 && (
            <div className="glass-panel" style={{ overflow: 'hidden', opacity: 0.7 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {completedTasks.map(task => (
                  <Link href={`/projects/${task.projectId}`} key={task.id} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div className="list-row-hover" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500, textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{task.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{task.project.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-success">Done</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
