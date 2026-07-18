import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser } from '../../redux/slices/userSlice';

export const Users = () => {
  const dispatch = useDispatch();
  const { users, status, error } = useSelector((state) => state.users);
  const [role, setRole] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ role: role || undefined, limit: 100 }));
  }, [dispatch, role]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Users</h1>
          </div>
          <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">All roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="WORKER">Workers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {status === 'loading' ? <p className="p-5 text-sm text-slate-600">Loading users...</p> : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-3"><div className="font-medium">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{user.assignedBranch?.name || '-'}</td>
                    <td className="px-4 py-3">{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3"><button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => dispatch(updateUser({ id: user._id, payload: { isActive: !user.isActive } }))}>{user.isActive ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </main>
  );
};
