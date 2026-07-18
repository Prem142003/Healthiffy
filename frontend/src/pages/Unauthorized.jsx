import { Link } from 'react-router-dom';

export const Unauthorized = () => (
  <main className="mx-auto max-w-xl px-4 py-10">
    <h1 className="text-2xl font-semibold">Unauthorized</h1>
    <p className="mt-2 text-slate-600">You do not have permission to access this page.</p>
    <Link className="mt-4 inline-block text-emerald-700" to="/">Return home</Link>
  </main>
);
