import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminBranches } from '../../redux/slices/branchSlice';
import { createWorker, fetchWorkers, updateUser } from '../../redux/slices/userSlice';

export const Workers = () => {
  const dispatch = useDispatch();
  const { workers, status, error } = useSelector((state) => state.users);
  const { branches } = useSelector((state) => state.branches);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchWorkers({ limit: 100 }));
    dispatch(fetchAdminBranches({ limit: 100 }));
  }, [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(createWorker(values));
    if (createWorker.fulfilled.match(result)) reset();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
          <h1 className="text-3xl font-semibold text-slate-950">Workers</h1>
        </div>
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-lg font-semibold">Create Worker</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Name" {...register('name', { required: true })} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email" type="email" {...register('email', { required: true })} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Phone" {...register('phone')} />
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Password" type="password" {...register('password', { required: true })} />
              <select className="w-full rounded-md border border-slate-300 px-3 py-2" {...register('assignedBranch')}>
                <option value="">Assign branch</option>
                {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
              </select>
            </div>
            <button className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white">Create Worker</button>
          </form>
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {status === 'loading' ? <p className="p-5 text-sm text-slate-600">Loading workers...</p> : (
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-700"><tr><th className="px-4 py-3">Worker</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                  {workers.map((worker) => (
                    <tr key={worker._id}>
                      <td className="px-4 py-3"><div className="font-medium">{worker.name}</div><div className="text-xs text-slate-500">{worker.email}</div></td>
                      <td className="px-4 py-3">{worker.assignedBranch?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3">{worker.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="px-4 py-3"><button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => dispatch(updateUser({ id: worker._id, payload: { isActive: !worker.isActive } }))}>{worker.isActive ? 'Deactivate' : 'Activate'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};
