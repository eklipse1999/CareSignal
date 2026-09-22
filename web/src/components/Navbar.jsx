import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function signOut() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/icon.png" alt="CareSignal logo" className="h-10 w-10 rounded-xl object-contain shadow-sm" />
          <span><strong className="block font-display text-lg text-ink dark:text-slate-100">CareSignal</strong><small className="block text-xs font-semibold uppercase tracking-[0.16em] text-ocean dark:text-teal-400">Clinical intelligence</small></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 dark:text-slate-400 md:flex">
          <Link className="transition hover:text-ink dark:hover:text-slate-100" to="/dashboard">Overview</Link>
          <Link className="transition hover:text-ink dark:hover:text-slate-100" to="/patients">Patients</Link>
          {user?.role === 'admin' && <Link className="transition hover:text-ink dark:hover:text-slate-100" to="/admin/create-clinician">Create clinician</Link>}
          {user?.role === 'admin' && <Link className="transition hover:text-ink dark:hover:text-slate-100" to="/admin/manage-clinicians">Manage clinicians</Link>}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block"><p className="text-sm font-bold text-ink dark:text-slate-100">{user?.name}</p><p className="text-xs capitalize text-slate-500 dark:text-slate-400">{user?.role}</p></div>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-lg text-slate-600 transition hover:border-ocean hover:text-ocean dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">{theme === 'dark' ? '☀' : '☾'}</button>
          <button onClick={signOut} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-coral hover:text-coral dark:border-slate-700 dark:text-slate-300">Sign out</button>
        </div>
      </div>
    </header>
  );
}
