import { Link, Outlet } from 'react-router-dom';

export const AuthShell = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <Link to="/" className="mb-6 block text-center text-2xl font-semibold text-emerald-700">
        Healthiffy
      </Link>
      <Outlet />
    </section>
  </main>
);
