import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ImageUploader } from '../../components/common/ImageUploader';
import { fetchAdminBranches } from '../../redux/slices/branchSlice';
import { fetchAdminCategories } from '../../redux/slices/categorySlice';
import {
  createMenuItem,
  deleteMenuItem,
  fetchAdminMenuItems,
  updateMenuItem,
  updateMenuItemAvailability
} from '../../redux/slices/menuItemSlice';

const emptyMenuItem = {
  name: '',
  description: '',
  price: '',
  offerPrice: '',
  imageUrl: '',
  category: '',
  branch: '',
  preparationTime: '',
  foodType: 'VEG',
  isBestseller: false,
  isAvailable: true,
  isActive: true,
  tags: ''
};

export const MenuItems = () => {
  const dispatch = useDispatch();
  const { menuItems, status, error } = useSelector((state) => state.menuItems);
  const { branches } = useSelector((state) => state.branches);
  const { categories } = useSelector((state) => state.categories);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [filters, setFilters] = useState({ search: '', branch: '', category: '' });

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: emptyMenuItem
  });

  useEffect(() => {
    dispatch(fetchAdminBranches({ limit: 100 }));
    dispatch(fetchAdminCategories({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAdminMenuItems({
      search: filters.search || undefined,
      branch: filters.branch || undefined,
      category: filters.category || undefined,
      limit: 100
    }));
  }, [dispatch, filters]);

  const activeBranches = useMemo(() => branches.filter((branch) => branch.isActive), [branches]);
  const activeCategories = useMemo(() => categories.filter((category) => category.isActive), [categories]);
  const availableCount = useMemo(() => menuItems.filter((item) => item.isAvailable && item.isActive).length, [menuItems]);

  const startEdit = (item) => {
    setEditingMenuItem(item);
    reset({
      name: item.name,
      description: item.description,
      price: item.price,
      offerPrice: item.offerPrice ?? '',
      imageUrl: item.image?.url || '',
      category: item.category?._id || item.category,
      branch: item.branch?._id || item.branch,
      preparationTime: item.preparationTime,
      foodType: item.foodType,
      isBestseller: item.isBestseller,
      isAvailable: item.isAvailable,
      isActive: item.isActive,
      tags: item.tags?.join(', ') || ''
    });
  };

  const cancelEdit = () => {
    setEditingMenuItem(null);
    reset(emptyMenuItem);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      price: Number(values.price),
      offerPrice: values.offerPrice === '' ? undefined : Number(values.offerPrice),
      preparationTime: Number(values.preparationTime),
      isBestseller: Boolean(values.isBestseller),
      isAvailable: Boolean(values.isAvailable),
      isActive: Boolean(values.isActive),
      tags: values.tags
    };

    const action = editingMenuItem
      ? updateMenuItem({ id: editingMenuItem._id, payload })
      : createMenuItem(payload);

    const result = await dispatch(action);
    if (createMenuItem.fulfilled.match(result) || updateMenuItem.fulfilled.match(result)) {
      cancelEdit();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Menu Management</h1>
            <p className="mt-1 text-sm text-slate-600">{availableCount} available menu items</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search menu"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              value={filters.branch}
              onChange={(event) => setFilters((current) => ({ ...current, branch: event.target.value }))}
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </select>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium">
                Item Name
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('name', { required: true })} />
              </label>
              <label className="block text-sm font-medium">
                Description
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" {...register('description', { required: true })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">
                  Price
                  <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="0" step="0.01" {...register('price', { required: true })} />
                </label>
                <label className="block text-sm font-medium">
                  Offer Price
                  <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="0" step="0.01" {...register('offerPrice')} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">
                  Branch
                  <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('branch', { required: true })}>
                    <option value="">Select branch</option>
                    {activeBranches.map((branch) => (
                      <option key={branch._id} value={branch._id}>{branch.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Category
                  <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('category', { required: true })}>
                    <option value="">Select category</option>
                    {activeCategories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">
                  Prep Time
                  <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="1" {...register('preparationTime', { required: true })} />
                </label>
                <label className="block text-sm font-medium">
                  Food Type
                  <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('foodType')}>
                    <option value="VEG">Veg</option>
                    <option value="NON_VEG">Non Veg</option>
                  </select>
                </label>
              </div>
              <label className="block text-sm font-medium">
                Image URL
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('imageUrl')} />
              </label>
              <ImageUploader folder="menu" onUploaded={(image) => setValue('imageUrl', image.url)} />
              <label className="block text-sm font-medium">
                Tags
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="coffee, hot, morning" {...register('tags')} />
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" {...register('isBestseller')} />
                  Bestseller
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" {...register('isAvailable')} />
                  Available
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" {...register('isActive')} />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={isSubmitting}>
                {editingMenuItem ? 'Save Changes' : 'Add Item'}
              </button>
              {editingMenuItem && (
                <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold">Menu Items</h2>
            </div>
            {status === 'loading' ? (
              <p className="p-5 text-sm text-slate-600">Loading menu items...</p>
            ) : menuItems.length === 0 ? (
              <p className="p-5 text-sm text-slate-600">No menu items found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {menuItems.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-950">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.foodType} · {item.preparationTime} min</div>
                          {item.isBestseller && <div className="mt-1 text-xs font-semibold text-emerald-700">Bestseller</div>}
                        </td>
                        <td className="px-4 py-3">{item.branch?.name || 'Unassigned'}</td>
                        <td className="px-4 py-3">{item.category?.name || 'Unassigned'}</td>
                        <td className="px-4 py-3">
                          <div>₹{item.price}</div>
                          {item.offerPrice !== undefined && <div className="text-xs text-emerald-700">Offer ₹{item.offerPrice}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${item.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                            {!item.isActive && <span className="w-fit rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Inactive</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => startEdit(item)}>Edit</button>
                            <button
                              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium"
                              onClick={() => dispatch(updateMenuItemAvailability({ id: item._id, isAvailable: !item.isAvailable }))}
                            >
                              {item.isAvailable ? 'Disable' : 'Enable'}
                            </button>
                            <button className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700" onClick={() => dispatch(deleteMenuItem(item._id))}>Delete</button>
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
