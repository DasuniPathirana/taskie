import { db } from '@/lib/db';
import Link from 'next/link';
import { Plus, Folder } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = session.user.id;

  const projects = await db.project.findMany({
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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage all your workspaces and their progress.</p>
        </div>
        <Link href="/projects/new" className="btn-primary">
          <Plus size={18} />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel flex-center" style={{ padding: '64px', flexDirection: 'column', color: 'var(--text-tertiary)' }}>
          <Folder size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No projects yet</h3>
          <p style={{ marginBottom: '24px' }}>Get started by creating your first project.</p>
          <Link href="/projects/new" className="btn-primary">
            Create Project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {projects.map(project => {
            const projectTasks = project.tasks.length;
            const projectCompletedTasks = project.tasks.filter(t => t.status === 'Done').length;
            const pProgress = projectTasks > 0 ? Math.round((projectCompletedTasks / projectTasks) * 100) : 0;
            
            return (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="flex-between" style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{project.name}</h3>
                    <span className={`badge ${project.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                      {project.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px', flex: 1 }}>
                    {project.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <div className="flex-between" style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>{projectCompletedTasks} / {projectTasks} Tasks</span>
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
