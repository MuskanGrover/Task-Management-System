'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { clearSession, getRefreshToken, getUser } from '../lib/auth';
import type { Task, TaskListResponse, TaskStatus } from '../lib/types';
import { useToast } from './ToastProvider';

type TaskFormState = {
  title: string;
  description: string;
  status: TaskStatus;
};

const emptyForm: TaskFormState = {
  title: '',
  description: '',
  status: 'PENDING'
};

export default function TaskDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const user = useMemo(() => getUser(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | TaskStatus>('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    void fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  async function fetchTasks(overrides?: { page?: number; search?: string; status?: 'ALL' | TaskStatus }) {
    setLoading(true);
    try {
      const nextPage = overrides?.page ?? page;
      const nextSearch = overrides?.search ?? search;
      const nextStatus = overrides?.status ?? status;
      const response = await api.get<TaskListResponse>('/tasks', {
        params: {
          page: nextPage,
          limit,
          ...(nextSearch ? { search: nextSearch } : {}),
          ...(nextStatus !== 'ALL' ? { status: nextStatus } : {})
        }
      });
      setTasks(response.data.items);
      setTotalPages(response.data.meta.totalPages || 1);
      setPage(response.data.meta.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function submitTask(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (editingTaskId) {
        await api.patch(`/tasks/${editingTaskId}`, form);
        showToast('Task updated successfully');
      } else {
        await api.post('/tasks', form);
        showToast('Task created successfully');
      }
      setForm(emptyForm);
      setEditingTaskId(null);
      await fetchTasks({ page: 1 });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Unable to save task');
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await api.delete(`/tasks/${id}`);
      showToast('Task deleted successfully');
      await fetchTasks();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Unable to delete task');
    }
  }

  async function onToggle(id: string) {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      showToast('Task status updated');
      await fetchTasks();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Unable to toggle task');
    }
  }

  async function onLogout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // no-op
    } finally {
      clearSession();
      router.push('/login');
    }
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="container">
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Welcome, {user?.name}</h1>
          <p className="small" style={{ margin: 0 }}>{user?.email}</p>
        </div>
        <button className="button button-secondary" onClick={onLogout}>Logout</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(280px, 360px) 1fr', alignItems: 'start' }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{editingTaskId ? 'Edit Task' : 'Add Task'}</h2>
          <form onSubmit={submitTask} className="stack">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="row">
              <button className="button button-primary" disabled={submitting}>{submitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Create Task'}</button>
              {editingTaskId ? (
                <button type="button" className="button button-secondary" onClick={() => { setEditingTaskId(null); setForm(emptyForm); }}>Cancel</button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="grid">
          <div className="card">
            <div className="toolbar">
              <input className="input" placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="select" value={status} onChange={(e) => { const nextStatus = e.target.value as 'ALL' | TaskStatus; setStatus(nextStatus); setPage(1); void fetchTasks({ page: 1, status: nextStatus }); }}>
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <button className="button button-primary" onClick={() => { setPage(1); void fetchTasks({ page: 1, search }); }}>Search</button>
            </div>
          </div>

          {loading ? (
            <div className="card">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="muted-box">No tasks found for the current filters.</div>
          ) : (
            <div className="grid task-grid">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
                    <h3 style={{ margin: 0 }}>{task.title}</h3>
                    <span className={`badge ${task.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="small" style={{ minHeight: 42 }}>{task.description || 'No description added.'}</p>
                  <p className="small">Updated: {new Date(task.updatedAt).toLocaleString()}</p>
                  <div className="row">
                    <button className="button button-secondary" onClick={() => startEdit(task)}>Edit</button>
                    <button className="button button-primary" onClick={() => onToggle(task.id)}>
                      {task.status === 'COMPLETED' ? 'Mark Pending' : 'Mark Done'}
                    </button>
                    <button className="button button-danger" onClick={() => onDelete(task.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pagination">
            <button className="button button-secondary" disabled={page <= 1} onClick={() => { const nextPage = page - 1; setPage(nextPage); void fetchTasks({ page: nextPage }); }}>Previous</button>
            <span className="small">Page {page} of {totalPages}</span>
            <button className="button button-secondary" disabled={page >= totalPages} onClick={() => { const nextPage = page + 1; setPage(nextPage); void fetchTasks({ page: nextPage }); }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
