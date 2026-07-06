import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Plus, Trash2 } from 'lucide-react';
import { createTask, updateTaskStatus, deleteTask } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const columns = ['Todo', 'InProgress', 'Review', 'Done'];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Link href="/projects" className="flex-center" style={{ width: 'fit-content', gap: '8px', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} />
          Back to Projects
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

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>Add New Task</h3>
        <form action={createTask.bind(null, project.id)} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              name="title" 
              required 
              className="input-field" 
              placeholder="Task title..."
            />
          </div>
          <div style={{ flex: 2 }}>
            <input 
              type="text" 
              name="description" 
              className="input-field" 
              placeholder="Task description (optional)..."
            />
          </div>
          <button type="submit" className="btn-primary">
            <Plus size={18} />
            Add
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        {columns.map(col => {
          const colTasks = project.tasks.filter(t => t.status === col);
          
          return (
            <div key={col} style={{ flex: '1', minWidth: '300px', background: 'var(--bg-surface-glass)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-color)' }}>
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
                      
                      <div className="flex-between" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                        <form action={deleteTask.bind(null, task.id, project.id)}>
                          <button type="submit" style={{ color: 'var(--danger)', padding: '4px' }}>
                            <Trash2 size={16} />
                          </button>
                        </form>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {col !== 'Todo' && (
                            <form action={updateTaskStatus.bind(null, task.id, columns[columns.indexOf(col) - 1], project.id)}>
                              <button type="submit" className="badge" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                                Prev
                              </button>
                            </form>
                          )}
                          {col !== 'Done' && (
                            <form action={updateTaskStatus.bind(null, task.id, columns[columns.indexOf(col) + 1], project.id)}>
                              <button type="submit" className="badge badge-primary">
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
