'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { setSession } from '../lib/auth';
import { useToast } from './ToastProvider';

type Mode = 'login' | 'register';

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;

      const response = await api.post(endpoint, payload);
      setSession(response.data.accessToken, response.data.refreshToken, response.data.user);
      showToast(mode === 'login' ? 'Logged in successfully' : 'Account created successfully');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: '0 0 6px' }}>Task Management System</h1>
          <p className="small" style={{ margin: 0 }}>
            {mode === 'login' ? 'Sign in to manage your tasks.' : 'Create your account to get started.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="stack">
          {mode === 'register' && (
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error ? <div className="error">{error}</div> : null}
          <button className="button button-primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="small" style={{ marginTop: 14 }}>
          {mode === 'login' ? (
            <>Don&apos;t have an account? <Link href="/register" style={{ color: '#2563eb', fontWeight: 700 }}>Register</Link></>
          ) : (
            <>Already have an account? <Link href="/login" style={{ color: '#2563eb', fontWeight: 700 }}>Login</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
