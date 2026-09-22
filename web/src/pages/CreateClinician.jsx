import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/Navbar';

const initialForm = { name: '', email: '', password: '' };

export default function CreateClinician() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
    setSuccess(null);
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess(null);
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosClient.post('/api/admin/clinicians', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      setSuccess(data.user);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create clinician.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link to="/dashboard" className="text-sm font-bold text-ocean transition hover:text-ink">← Back to overview</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean">Administration</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">Create clinician</h1>
            <p className="mt-4 max-w-md leading-7 text-slate-500">Invite a trusted member of the care team to review patient histories and prediction trends.</p>
            <div className="mt-10 rounded-2xl bg-ink p-7 text-white shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Account permissions</p>
              <p className="mt-3 font-display text-2xl font-bold">Clinician access</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">New accounts can view patients and prediction history. They cannot create administrator accounts or access this administration screen.</p>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-soft sm:p-10">
            {success ? (
              <div className="py-8">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">✓</div>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Clinician created</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink">{success.name}</h2>
                <p className="mt-3 text-slate-500">{success.email} can now sign in with clinician access.</p>
                <button type="button" onClick={() => setSuccess(null)} className="mt-8 rounded-xl bg-ink px-5 py-3.5 text-sm font-bold text-white transition hover:bg-ocean">Create another</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">New team member</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-ink">Clinician details</h2>
                <div className="mt-8 space-y-5">
                  <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Name</span><input name="name" value={form.name} onChange={updateField} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-ocean focus:bg-white focus:ring-4 focus:ring-teal-50" placeholder="Dr. Maya Patel" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><input name="email" type="email" value={form.email} onChange={updateField} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-ocean focus:bg-white focus:ring-4 focus:ring-teal-50" placeholder="maya.patel@example.com" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Temporary password</span><div className="flex gap-2"><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField} required minLength={8} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-ocean focus:bg-white focus:ring-4 focus:ring-teal-50" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-ocean hover:text-ocean">{showPassword ? 'Hide' : 'Show'}</button></div><span className="mt-2 block text-xs leading-5 text-slate-500">Use at least 8 characters. Do not include the clinician's name or email username.</span></label>
                </div>
                {error && <p role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
                <button disabled={loading} className="mt-8 w-full rounded-xl bg-ink px-5 py-4 font-bold text-white transition hover:bg-ocean disabled:cursor-wait disabled:opacity-60">{loading ? 'Creating account...' : 'Create clinician account'}</button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
