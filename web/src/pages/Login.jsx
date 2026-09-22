import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/api/auth/login', form);
      login(data.token, data.user);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-12">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ocean/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-coral/20 blur-3xl" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[1.1fr_.9fr]">
        <div className="hidden bg-[linear-gradient(145deg,#143b56,#0f766e)] p-12 text-white lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-100">CareSignal / clinical intelligence</p>
          <h1 className="mt-28 max-w-md font-display text-5xl font-bold leading-[1.05]">A clearer view of patient risk.</h1>
          <p className="mt-6 max-w-sm text-lg leading-8 text-slate-200">Bring prediction history, trend signals, and patient context into one calm workspace.</p>
          <div className="mt-24 flex items-center gap-3 text-sm font-semibold text-teal-100"><span className="h-px w-10 bg-teal-200/60" />Secure clinician access</div>
        </div>
        <div className="p-8 sm:p-12 lg:p-16">
          <div className="mb-12 lg:hidden"><img src="/icon.png" alt="CareSignal logo" className="h-10 w-10 rounded-xl object-contain shadow-sm" /></div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ocean">Welcome back</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Sign in to CareSignal</h2>
          <p className="mt-3 text-slate-500">Use your clinician or administrator account.</p>
          <form onSubmit={submit} className="mt-10 space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-ocean focus:bg-white focus:ring-4 focus:ring-teal-50" placeholder="clinician@example.com" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Password</span><input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-ocean focus:bg-white focus:ring-4 focus:ring-teal-50" placeholder="Enter your password" /></label>
            {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl bg-ink px-5 py-4 font-bold text-white transition hover:bg-ocean disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in...' : 'Continue to dashboard'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
