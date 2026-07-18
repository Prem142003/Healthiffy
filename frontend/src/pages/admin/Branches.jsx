import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ImageUploader } from '../../components/common/ImageUploader';
import {
  createBranch,
  deleteBranch,
  fetchAdminBranches,
  updateBranch,
  updateBranchStatus
} from '../../redux/slices/branchSlice';

const emptyBranch = {
  name: '',
  address: '',
  contactNumber: '',
  openingTime: '',
  closingTime: '',
  googleMapLink: '',
  imageUrl: '',
  status: 'OPEN',
  isActive: true
};

export const Branches = () => {
  const dispatch = useDispatch();
  const { branches, status, error } = useSelector((state) => state.branches);
  const [editingBranch, setEditingBranch] = useState(null);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: emptyBranch
  });

  useEffect(() => {
    dispatch(fetchAdminBranches({ search: search || undefined, limit: 50 }));
  }, [dispatch, search]);

  const activeCount = useMemo(() => branches.filter((branch) => branch.isActive).length, [branches]);

  const startEdit = (branch) => {
    setEditingBranch(branch);
    reset({
      name: branch.name,
      address: branch.address,
      contactNumber: branch.contactNumber,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
      googleMapLink: branch.googleMapLink || '',
      imageUrl: branch.image?.url || '',
      status: branch.status,
      isActive: branch.isActive
    });
  };

  const cancelEdit = () => {
    setEditingBranch(null);
    reset(emptyBranch);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      isActive: Boolean(values.isActive)
    };

    const action = editingBranch
      ? updateBranch({ id: editingBranch._id, payload })
      : createBranch(payload);

    const result = await dispatch(action);
    if (createBranch.fulfilled.match(result) || updateBranch.fulfilled.match(result)) {
      cancelEdit();
    }
  };

  const toggleStatus = (branch) => {
    dispatch(updateBranchStatus({
      id: branch._id,
      status: branch.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Branch Management</h1>
            <p className="mt-1 text-sm text-slate-600">{activeCount} active branches</p>
          </div>
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:w-72"
            placeholder="Search branches"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium">
                Branch Name
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('name', { required: true })} />
              </label>
              <label className="block text-sm font-medium">
                Address
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" {...register('address', { required: true })} />
              </label>
              <label className="block text-sm font-medium">
                Contact Number
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('contactNumber', { required: true })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">
                  Opening
                  <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="time" {...register('openingTime', { required: true })} />
                </label>
                <label className="block text-sm font-medium">
                  Closing
                  <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="time" {...register('closingTime', { required: true })} />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Google Map Link
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('googleMapLink')} />
              </label>
              <label className="block text-sm font-medium">
                Image URL
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('imageUrl')} />
              </label>
              <ImageUploader folder="branches" onUploaded={(image) => setValue('imageUrl', image.url)} />
              <label className="block text-sm font-medium">
                Status
                <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('status')}>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" {...register('isActive')} />
                Active branch
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={isSubmitting}>
                {editingBranch ? 'Save Changes' : 'Add Branch'}
              </button>
              {editingBranch && (
                <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold">Branches</h2>
            </div>
            {status === 'loading' ? (
              <p className="p-5 text-sm text-slate-600">Loading branches...</p>
            ) : branches.length === 0 ? (
              <p className="p-5 text-sm text-slate-600">No branches found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Active</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {branches.map((branch) => (
                      <tr key={branch._id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-950">{branch.name}</div>
                          <div className="text-xs text-slate-500">{branch.address}</div>
                          <div className="text-xs text-slate-500">{branch.contactNumber}</div>
                        </td>
                        <td className="px-4 py-3">{branch.openingTime} - {branch.closingTime}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${branch.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {branch.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{branch.isActive ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => startEdit(branch)}>Edit</button>
                            <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => toggleStatus(branch)}>
                              {branch.status === 'OPEN' ? 'Close' : 'Open'}
                            </button>
                            <button className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700" onClick={() => dispatch(deleteBranch(branch._id))}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};
