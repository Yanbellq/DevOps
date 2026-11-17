import { useCallback, useEffect, useState } from 'react';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'connected' | 'disconnected';
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async (activeFilter: 'all' | TaskStatus) => {
    setLoading(true);
    setError(null);
    try {
      const query = activeFilter === 'all' ? '' : `?status=${activeFilter}`;
      const res = await fetch(`${API_BASE}/tasks${query}`);
      if (!res.ok) throw new Error(`Failed to fetch tasks (${res.status})`);
      const data = (await res.json()) as Task[];
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/health`)
      .then(async res => {
        if (!res.ok) throw new Error('Unhealthy');
        return (await res.json()) as HealthResponse;
      })
      .then(data => {
        if (active) setHealth(data);
      })
      .catch(() => {
        if (active) setHealth({ status: 'degraded', database: 'disconnected' });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const query = filter === 'all' ? '' : `?status=${filter}`;
    fetch(`${API_BASE}/tasks${query}`)
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to fetch tasks (${res.status})`);
        return (await res.json()) as Task[];
      })
      .then(data => {
        if (active) {
          setTasks(data);
          setError(null);
        }
      })
      .catch(err => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load tasks');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
        }),
      });
      if (!res.ok) throw new Error(`Failed to create task (${res.status})`);
      setTitle('');
      setDescription('');
      setPriority('medium');
      await loadTasks(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  }

  async function handleAdvanceStatus(task: Task) {
    const nextStatus = NEXT_STATUS[task.status];
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(`Failed to update task (${res.status})`);
      await loadTasks(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete task (${res.status})`);
      setTasks(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }

  return (
    <main className='container'>
      <header className='header'>
        <div>
          <h1>TaskFlow</h1>
          <p className='subtitle'>Vite + NestJS + PostgreSQL DevOps Project</p>
        </div>
        <div className='health-badge' data-testid='health-badge'>
          <span className={`dot ${health?.status === 'ok' ? 'ok' : 'degraded'}`} />
          <span>
            API: {health?.status ?? 'checking'} | DB: {health?.database ?? '...'}
          </span>
        </div>
      </header>

      <section className='card'>
        <form className='form-grid' onSubmit={handleCreate}>
          <div className='form-row'>
            <input
              aria-label='Task title'
              placeholder='New task title...'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <select
              aria-label='Task priority'
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              style={{ maxWidth: 140 }}
            >
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
          </div>
          <textarea
            aria-label='Task description'
            placeholder='Optional description...'
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div>
            <button type='submit' className='primary'>
              Add Task
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className='error-banner' role='alert'>
          {error}
        </div>
      )}

      <div className='filters' role='tablist' aria-label='Filter tasks by status'>
        {(['all', 'todo', 'in_progress', 'done'] as const).map(status => (
          <button
            key={status}
            type='button'
            className={filter === status ? 'active' : ''}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className='empty'>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className='empty'>No tasks yet. Create one above.</p>
      ) : (
        <section className='task-list'>
          {tasks.map(task => (
            <article key={task.id} className='task-item'>
              <div>
                <h2 className='task-title'>{task.title}</h2>
                {task.description && <p className='task-desc'>{task.description}</p>}
                <div className='meta'>
                  <span className='pill'>{STATUS_LABEL[task.status]}</span>
                  <span className='pill'>{task.priority}</span>
                </div>
              </div>
              <div className='task-actions'>
                <button type='button' onClick={() => void handleAdvanceStatus(task)}>
                  Move to {STATUS_LABEL[NEXT_STATUS[task.status]]}
                </button>
                <button
                  type='button'
                  className='danger'
                  onClick={() => void handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
