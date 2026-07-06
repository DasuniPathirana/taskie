import { db } from '@/lib/db';
import Link from 'next/link';
import { Folder, Clock, CheckCircle, BarChart3, Plus, Settings } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = session.user.id;
  const isAdmin = session.user.role === 'Admin';

  const userProjects = await db.project.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      tasks: true,
    }
  });

  const projectsCount = userProjects.length;
  
  let tasksCount = 0;
  let completedTasks = 0;
  
  userProjects.forEach(project => {
    tasksCount += project.tasks.length;
    completedTasks += project.tasks.filter(t => t.status === 'Done').length;
  });

  const progress = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0;
  
  const recentProjects = userProjects.slice(0, 3);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {session.user.name || 'User'}! Here's your overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isAdmin && (
            <Link href="/admin" className="btn-secondary" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none' }}>
              <Settings size={18} />
              Super Admin
            </Link>
          )}
          <Link href="/projects/new" className="btn-primary">
            <Plus size={18} />
            New Project
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Folder size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Projects</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{projectsCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Tasks Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedTasks} / {tasksCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Overall Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{progress}%</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Recent Projects</h2>
      
      {recentProjects.length === 0 ? (
        <div className="glass-panel flex-center" style={{ padding: '48px', flexDirection: 'column', color: 'var(--text-tertiary)' }}>
          <Folder size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No projects found. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {recentProjects.map(project => {
            const projectTasks = project.tasks.length;
            const projectCompletedTasks = project.tasks.filter(t => t.status === 'Done').length;
            const pProgress = projectTasks > 0 ? Math.round((projectCompletedTasks / projectTasks) * 100) : 0;
            
            return (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div className="flex-between" style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{project.name}</h3>
                    <span className={`badge ${project.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                      {project.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description || 'No description provided.'}
                  </p>
                  
                  <div>
                    <div className="flex-between" style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>Progress</span>
                      <span>{pProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
