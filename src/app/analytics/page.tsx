import { db } from '@/lib/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BarChart, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Analytics() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const userId = session.user.id;
  const isAdmin = session.user.role === 'Admin';

  // Fetch projects user is involved in
  const projects = await db.project.findMany({
    where: isAdmin ? {} : { members: { some: { userId } } },
    include: { tasks: true, members: { include: { user: true } } }
  });

  const totalTasks = projects.flatMap(p => p.tasks).length;
  const newTasks = projects.flatMap(p => p.tasks).filter(t => t.status === 'New').length;
  const inProgressTasks = projects.flatMap(p => p.tasks).filter(t => t.status === 'InProgress').length;
  const reviewTasks = projects.flatMap(p => p.tasks).filter(t => t.status === 'Review').length;
  const doneTasks = projects.flatMap(p => p.tasks).filter(t => t.status === 'Done').length;

  const workloadByMember = new Map<string, { name: string, count: number }>();
  projects.forEach(p => {
    p.tasks.forEach(t => {
      if (t.assigneeId && t.status !== 'Done') {
        const member = p.members.find(m => m.userId === t.assigneeId);
        if (member) {
          const existing = workloadByMember.get(t.assigneeId) || { name: member.user.name, count: 0 };
          existing.count += 1;
          workloadByMember.set(t.assigneeId, existing);
        }
      }
    });
  });
  
  const workloadArray = Array.from(workloadByMember.values()).sort((a, b) => b.count - a.count);
  const maxWorkload = workloadArray.length > 0 ? workloadArray[0].count : 1;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Workspace metrics and workload distribution.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel flex-center" style={{ padding: '24px', flexDirection: 'column', gap: '8px' }}>
          <BarChart size={32} color="var(--text-tertiary)" />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalTasks}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Tasks</div>
        </div>
        <div className="glass-panel flex-center" style={{ padding: '24px', flexDirection: 'column', gap: '8px' }}>
          <AlertCircle size={32} color="var(--warning)" />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{newTasks}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>New Tasks</div>
        </div>
        <div className="glass-panel flex-center" style={{ padding: '24px', flexDirection: 'column', gap: '8px' }}>
          <Clock size={32} color="var(--primary)" />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{inProgressTasks + reviewTasks}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>In Progress / Review</div>
        </div>
        <div className="glass-panel flex-center" style={{ padding: '24px', flexDirection: 'column', gap: '8px' }}>
          <CheckCircle size={32} color="var(--success)" />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{doneTasks}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Completed</div>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '24px' }}>Active Workload by Member</h3>
          {workloadArray.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px' }}>
              No active tasks assigned to anyone.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {workloadArray.map(item => (
                <div key={item.name}>
                  <div className="flex-between" style={{ marginBottom: '8px', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.count} tasks</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(item.count / maxWorkload) * 100}%`, 
                      height: '100%', 
                      background: 'var(--primary)', 
                      borderRadius: '4px',
                      opacity: 0.8
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
