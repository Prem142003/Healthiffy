import { ArrowLeft, Leaf } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export const AuthShell = () => (
  <main className="auth-mobile-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
    <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#ede383]/40 blur-3xl" />
    <div className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[#925e06]/20 blur-3xl" />
    <section className="relative w-full max-w-lg rounded-3xl border border-[#351903]/10 bg-[#f7f0b1]/95 p-6 shadow-2xl backdrop-blur sm:p-10">
      <Link to="/" className="mb-8 flex items-center justify-center gap-3 text-[#351903]">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#365004] text-[#ede383]"><Leaf size={24} /></span>
        <span><strong className="font-heading block text-2xl font-black tracking-tight">HEALTHIFFY</strong><small className="block text-xs font-bold uppercase tracking-[0.14em] text-[#925e06]">Pure veg cafe</small></span>
      </Link>
      <Outlet />
      <Link to="/" className="mt-8 flex items-center justify-center gap-2 border-t border-[#351903]/10 pt-6 text-sm font-bold text-[#365004]"><ArrowLeft size={16} /> Back to menu</Link>
    </section>
  </main>
);
