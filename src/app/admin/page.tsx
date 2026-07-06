import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Folder, Trash2, Shield } from 'lucide-react';
import { auth } from '@/auth';
import { deleteProject } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== 'Admin') {
    redirect('/');
  }

  // Fetch all users with their projects
  const usersWithProjects = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      projects: {
        include: {
          project: {
            include: {
              tasks: true,
              members: {
                include: { user: true }
              }
            }
          }
        }
      }
    }
  });

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
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--primary)' }}>⚡</span> Super Admin Dashboard
          </h1>
          <p className="page-subtitle">Manage all users and their associated projects across the system.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '32px' }}>
        {usersWithProjects.map(user => (
          <div key={user.id} className="glass-panel" style={{ padding: '32px' }}>
            <div className="flex-between" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.name}
                    {user.role === 'Admin' && <Shield size={16} color="var(--primary)" />}
                  </h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <span className={`badge ${user.role === 'Admin' ? 'badge-primary' : ''}`} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                {user.role}
              </span>
            </div>
            
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Folder size={16} /> Workspaces ({user.projects.length})
            </h4>

            {user.projects.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                This user is not a member of any projects yet.
              </div>
            ) : (
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {user.projects.map(pm => {
                  const project = pm.project;
                  const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
                  const totalTasks = project.tasks.length;
                  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                  return (
                    <div key={project.id} style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{project.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>
                            User Role: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pm.role}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${project.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                            {project.status}
                          </span>
                          <form action={deleteProject.bind(null, project.id)}>
                            <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}>
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '16px' }}>
                        <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>{completedTasks} / {totalTasks} Tasks</span>
                          <span>{progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', width: '100%', marginBottom: '4px' }}>All Members:</span>
                        {project.members.map(m => (
                          <span key={m.id} className="badge" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                            {m.user.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
