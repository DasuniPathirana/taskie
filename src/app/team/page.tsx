import { db } from '@/lib/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { User, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeamDirectory() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = session.user.id;
  const isAdmin = session.user.role === 'Admin';

  // Get all projects the user is involved in (or all if admin)
  const projects = await db.project.findMany({
    where: isAdmin ? {} : { members: { some: { userId } } },
    include: { members: { include: { user: true } } }
  });

  // Extract unique users
  const uniqueUsersMap = new Map<string, { id: string, name: string, email: string, roles: Set<string>, projectsCount: number }>();

  projects.forEach(p => {
    p.members.forEach(m => {
      if (m.user) {
        const existing = uniqueUsersMap.get(m.userId) || { id: m.userId, name: m.user.name, email: m.user.email, roles: new Set(), projectsCount: 0 };
        existing.roles.add(m.role);
        existing.projectsCount += 1;
        uniqueUsersMap.set(m.userId, existing);
      }
    });
  });

  const teamMembers = Array.from(uniqueUsersMap.values());

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Directory</h1>
          <p className="page-subtitle">People you collaborate with across your workspaces.</p>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {teamMembers.map(member => (
          <div key={member.id} className="glass-panel list-row-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="flex-center" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '16px' }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
            
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '4px' }}>{member.name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              <Mail size={14} />
              {member.email}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from(member.roles).map(role => (
                <span key={role} className={`badge ${role === 'OWNER' ? 'badge-primary' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                  {role}
                </span>
              ))}
              <span className="badge" style={{ fontSize: '0.7rem' }}>
                {member.projectsCount} Project{member.projectsCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
