import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mist px-6">
        <section className="max-w-md rounded-2xl bg-white p-10 text-center shadow-soft">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-coral">Access restricted</p>
          <h1 className="font-display text-3xl font-bold text-ink">Admin access required</h1>
          <p className="mt-4 text-slate-600">Only administrators can create clinician accounts.</p>
          <a href="/dashboard" className="mt-8 inline-block rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-ocean">Return to dashboard</a>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
