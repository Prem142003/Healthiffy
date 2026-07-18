import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const AdminSettings = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Settings</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Profile</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div><span className="text-slate-500">Name:</span> {user?.name}</div>
              <div><span className="text-slate-500">Email:</span> {user?.email}</div>
              <div><span className="text-slate-500">Role:</span> {user?.role}</div>
            </div>
            <Link className="mt-4 inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/change-password">
              Change Password
            </Link>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Business Settings</h2>
            <div className="mt-4 grid gap-2">
              <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/admin/payment-settings">UPI And QR Settings</Link>
              <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/admin/branches">Branch Settings</Link>
              <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/admin/users">User Access</Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};
