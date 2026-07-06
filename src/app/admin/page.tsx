import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Folder, Trash2 } from 'lucide-react';
import { auth } from '@/auth';
import { deleteProject } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== 'Admin') {
    redirect('/');
  }

  const allUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const allProjects = await db.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tasks: true,
      members: {
        include: { user: true }
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
          <p className="page-subtitle">Manage all users and projects across the system.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Users Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> All Users
            </h3>
            <span className="badge">{allUsers.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allUsers.map(u => (
              <div key={u.id} className="flex-between" style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role === 'Admin' ? 'badge-primary' : ''}`} style={{ fontSize: '0.75rem' }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Folder size={18} /> All Projects
            </h3>
            <span className="badge">{allProjects.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allProjects.map(project => (
              <div key={project.id} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{project.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{project.tasks.length} Tasks • {project.members.length} Members</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${project.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                      {project.status}
                    </span>
                    <form action={deleteProject.bind(null, project.id)}>
                      <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  {project.members.map(m => (
                    <span key={m.id} className="badge" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                      {m.user.name} ({m.role})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
