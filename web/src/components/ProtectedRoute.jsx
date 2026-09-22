import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user?.role === 'patient') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mist px-6">
        <section className="max-w-md rounded-2xl bg-white p-10 text-center shadow-soft">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-coral">Access restricted</p>
          <h1 className="font-display text-3xl font-bold text-ink">Clinician workspace only</h1>
          <p className="mt-4 text-slate-600">This dashboard is reserved for clinician and administrator accounts.</p>
        </section>
      </main>
    );
  }
  return <Outlet />;
}
