import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImageUploader } from '../../components/common/ImageUploader';
import { branchApi } from '../../services/branchApi';
import { menuItemApi } from '../../services/menuItemApi';
import { subscriptionApi } from '../../services/subscriptionApi';

const emptyPlan = {
  name: '',
  menuItem: '',
  branches: [],
  description: '',
  imageUrl: '',
  price: '',
  durationDays: 30,
  totalMeals: 30,
  isActive: true
};

export const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [branches, setBranches] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({ defaultValues: emptyPlan });

  const load = useCallback(async () => {
    try {
      setError('');
      const [plansResponse, branchesResponse, menuResponse] = await Promise.all([
        subscriptionApi.getAdminPlans({ limit: 100 }),
        branchApi.getAdminBranches({ limit: 100 }),
        menuItemApi.getAdminMenuItems({ limit: 100 })
      ]);
      setPlans(plansResponse.data.data.plans);
      setBranches(branchesResponse.data.data.branches.filter((branch) => branch.isActive));
      setMenuItems(menuResponse.data.data.menuItems.filter((item) => item.isActive));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load monthly plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (plan) => {
    setEditing(plan);
    reset({
      name: plan.name,
      menuItem: plan.menuItem?._id || plan.menuItem,
      branches: plan.branches.map((branch) => branch._id || branch),
      description: plan.description || '',
      imageUrl: plan.image?.url || '',
      price: plan.price,
      durationDays: plan.durationDays,
      totalMeals: plan.totalMeals,
      isActive: plan.isActive
    });
  };

  const clearForm = () => {
    setEditing(null);
    reset(emptyPlan);
  };

  const save = async (values) => {
    try {
      setError('');
      const payload = {
        ...values,
        branches: Array.isArray(values.branches) ? values.branches : [values.branches],
        price: Number(values.price),
        durationDays: Number(values.durationDays),
        totalMeals: Number(values.totalMeals),
        isActive: Boolean(values.isActive)
      };
      if (editing) await subscriptionApi.updatePlan(editing._id, payload);
      else await subscriptionApi.createPlan(payload);
      clearForm();
      await load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to save the plan.');
    }
  };

  const deactivate = async (plan) => {
    try {
      if (plan.isActive) await subscriptionApi.deactivatePlan(plan._id);
      else await subscriptionApi.updatePlan(plan._id, { isActive: true });
      await load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to update the plan.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
          <h1 className="text-3xl font-semibold text-slate-950">Monthly Meal Plans</h1>
          <p className="mt-1 text-sm text-slate-600">Plans reference existing menu items and can be offered by multiple branches.</p>
        </div>
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit(save)}>
            <h2 className="text-lg font-semibold">{editing ? 'Edit Plan' : 'Create Plan'}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium">Plan Name<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('name', { required: true })} /></label>
              <label className="block text-sm font-medium">Meal<select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('menuItem', { required: true })}><option value="">Select menu item</option>{menuItems.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.branch?.name}</option>)}</select></label>
              <fieldset>
                <legend className="text-sm font-medium">Available Branches</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {branches.map((branch) => <label key={branch._id} className="flex items-center gap-2 text-sm"><input type="checkbox" value={branch._id} {...register('branches', { required: true })} />{branch.name}</label>)}
                </div>
              </fieldset>
              <label className="block text-sm font-medium">Description<textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" {...register('description')} /></label>
              <label className="block text-sm font-medium">Plan Image URL<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('imageUrl')} /></label>
              <ImageUploader folder="subscription-plans" onUploaded={(image) => setValue('imageUrl', image.url)} />
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-sm font-medium">Price<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="1" step="0.01" {...register('price', { required: true })} /></label>
                <label className="block text-sm font-medium">Days<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="1" max="366" {...register('durationDays', { required: true })} /></label>
                <label className="block text-sm font-medium">Meals<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="1" max="366" {...register('totalMeals', { required: true })} /></label>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...register('isActive')} />Active plan</label>
            </div>
            <div className="mt-5 flex gap-2">
              <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={isSubmitting}>{editing ? 'Save Changes' : 'Create Plan'}</button>
              {editing && <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" onClick={clearForm} type="button">Cancel</button>}
            </div>
          </form>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-semibold">Plans</h2></div>
            {loading ? <p className="p-5 text-sm text-slate-600">Loading plans...</p> : plans.length === 0 ? <p className="p-5 text-sm text-slate-600">No plans created.</p> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-100 text-slate-700"><tr><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Branches</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Schedule</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-200">{plans.map((plan) => <tr key={plan._id}><td className="px-4 py-3"><div className="font-medium text-slate-950">{plan.name}</div><div className="text-xs text-slate-500">{plan.menuItem?.name}</div>{!plan.isActive && <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Inactive</span>}</td><td className="px-4 py-3">{plan.branches.map((branch) => branch.name).join(', ')}</td><td className="px-4 py-3">₹{plan.price}</td><td className="px-4 py-3">{plan.totalMeals} meals / {plan.durationDays} days</td><td className="px-4 py-3"><div className="flex gap-2"><button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => startEdit(plan)}>Edit</button><button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => deactivate(plan)}>{plan.isActive ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table></div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

