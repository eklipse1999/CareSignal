import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/Navbar';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ManageClinicians() {
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function loadClinicians() {
    setError('');
    try {
      const { data } = await axiosClient.get('/api/admin/clinicians');
      setClinicians(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load clinicians.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClinicians(); }, []);

  async function toggleStatus(clinician) {
    if (!clinician.is_active && !window.confirm('Are you sure? This clinician will regain access immediately')) return;
    if (clinician.is_active && !window.confirm('Are you sure? This clinician will lose access immediately')) return;

    setBusyId(clinician.id);
    setError('');
    try {
      const action = clinician.is_active ? 'deactivate' : 'reactivate';
      const { data } = await axiosClient.patch(`/api/admin/clinicians/${clinician.id}/${action}`);
      setClinicians((current) => current.map((item) => item.id === clinician.id ? { ...item, is_active: data.is_active } : item));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update clinician status.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link to="/dashboard" className="text-sm font-bold text-ocean transition hover:text-ink">← Back to overview</Link>
        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean">Administration</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Manage clinicians</h1>
            <p className="mt-3 text-slate-500">Control access for the clinical team.</p>
          </div>
          <Link to="/admin/create-clinician" className="rounded-xl bg-ink px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-ocean">Create clinician</Link>
        </div>
        {error && <div role="alert" className="mt-8 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          {loading ? <div className="p-12 text-center text-slate-500">Loading clinician accounts...</div> : clinicians.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No clinician accounts found.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="border-b border-slate-200 bg-slate-50"><tr><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Clinician</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Created</th><th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{clinicians.map((clinician) => <tr key={clinician.id} className="transition hover:bg-mist"><td className="px-6 py-5"><strong className="block text-sm text-ink">{clinician.name}</strong><span className="text-xs text-slate-500">{clinician.email}</span></td><td className="px-6 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${clinician.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{clinician.is_active ? 'Active' : 'Deactivated'}</span></td><td className="px-6 py-5 text-sm text-slate-500">{formatDate(clinician.created_at)}</td><td className="px-6 py-5 text-right"><button disabled={busyId === clinician.id} onClick={() => toggleStatus(clinician)} className={`rounded-lg border px-3 py-2 text-sm font-bold transition disabled:cursor-wait disabled:opacity-50 ${clinician.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-ocean/30 text-ocean hover:bg-teal-50'}`}>{busyId === clinician.id ? 'Updating...' : clinician.is_active ? 'Deactivate' : 'Reactivate'}</button></td></tr>)}</tbody></table></div>}
        </section>
      </main>
    </div>
  );
}
