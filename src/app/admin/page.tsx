import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Users, Folder, Trash2, Shield, Activity, Target, CheckCircle2 } from 'lucide-react';
import { auth } from '@/auth';
import DeleteProjectForm from '@/components/DeleteProjectForm';

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

  const totalUsers = usersWithProjects.length;
  
  let totalWorkspaces = 0;
  let totalTasks = 0;
  let totalCompletedTasks = 0;

  // We need to fetch all projects and tasks independently for platform metrics
  const allProjects = await db.project.findMany({
    include: { tasks: true }
  });

  totalWorkspaces = allProjects.length;
  allProjects.forEach(p => {
    totalTasks += p.tasks.length;
    totalCompletedTasks += p.tasks.filter(t => t.status === 'Done').length;
  });

  const completionRate = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Section */}
      <div style={{ marginBottom: '40px', padding: '40px', background: 'var(--bg-surface-glass)', backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 60%)', opacity: 0.5, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Command Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Platform overview and user management.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} className="pulse-animation" />
            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', alignSelf: 'flex-start' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalUsers}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Active Accounts</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', alignSelf: 'flex-start' }}>
            <Folder size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalWorkspaces}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Workspaces</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', alignSelf: 'flex-start' }}>
            <Target size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalTasks}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>System-Wide Tasks</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', alignSelf: 'flex-start' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{completionRate}%</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Global Completion Rate</div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        User Directory
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
        {usersWithProjects.map(user => (
          <div key={user.id} className="glass-panel" style={{ padding: '24px' }}>
            
            {/* User Header */}
            <div className="flex-between" style={{ marginBottom: user.projects.length > 0 ? '24px' : '0', paddingBottom: user.projects.length > 0 ? '24px' : '0', borderBottom: user.projects.length > 0 ? '1px solid var(--border-color)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="flex-center" style={{ width: 56, height: 56, borderRadius: '16px', background: user.role === 'Admin' ? 'var(--primary)' : 'var(--bg-surface)', border: '1px solid var(--border-color)', color: user.role === 'Admin' ? '#fff' : 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: user.role === 'Admin' ? '0 0 20px var(--primary-glow)' : 'none' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {user.name}
                    {user.role === 'Admin' && <Shield size={16} color="var(--primary)" />}
                  </h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>{user.email}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${user.role === 'Admin' ? 'badge-primary' : ''}`} style={{ fontSize: '0.75rem', padding: '6px 12px', marginBottom: '8px', display: 'inline-block' }}>
                  {user.role}
                </span>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Joined {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Workspaces List */}
            {user.projects.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workspaces</h4>
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {user.projects.map(pm => {
                    const project = pm.project;
                    const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
                    const totalTasks = project.tasks.length;
                    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                    return (
                      <div key={project.id} style={{ padding: '20px', background: 'var(--bg-base)', borderRadius: '16px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } } as React.CSSProperties}>
                        <div className="flex-between" style={{ marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{project.name}</div>
                            <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>
                              {pm.role}
                            </div>
                          </div>
                          <DeleteProjectForm projectId={project.id} />
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                          <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            <span>{completedTasks} / {totalTasks} Tasks</span>
                            <span>{progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={14} color="var(--text-tertiary)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
