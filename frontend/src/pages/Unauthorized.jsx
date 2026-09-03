import { Link } from 'react-router-dom';

export const Unauthorized = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md sm:p-12">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#925e06]">Access restricted</p>
      <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight text-slate-950">You can’t open this page</h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">Your account does not have permission to access this area.</p>
      <Link className="mt-7 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white" to="/">Return home</Link>
    </section>
  </main>
);
