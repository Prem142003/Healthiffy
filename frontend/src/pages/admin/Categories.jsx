import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ImageUploader } from '../../components/common/ImageUploader';
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
  updateCategoryStatus
} from '../../redux/slices/categorySlice';

const emptyCategory = {
  name: '',
  description: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true
};

export const Categories = () => {
  const dispatch = useDispatch();
  const { categories, status, error } = useSelector((state) => state.categories);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: emptyCategory
  });

  useEffect(() => {
    dispatch(fetchAdminCategories({ search: search || undefined, limit: 100 }));
  }, [dispatch, search]);

  const activeCount = useMemo(() => categories.filter((category) => category.isActive).length, [categories]);

  const startEdit = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
      imageUrl: category.image?.url || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    reset(emptyCategory);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      displayOrder: Number(values.displayOrder || 0),
      isActive: Boolean(values.isActive)
    };

    const action = editingCategory
      ? updateCategory({ id: editingCategory._id, payload })
      : createCategory(payload);

    const result = await dispatch(action);
    if (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      cancelEdit();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Category Management</h1>
            <p className="mt-1 text-sm text-slate-600">{activeCount} active categories</p>
          </div>
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:w-72"
            placeholder="Search categories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium">
                Category Name
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('name', { required: true })} />
              </label>
              <label className="block text-sm font-medium">
                Description
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" {...register('description')} />
              </label>
              <label className="block text-sm font-medium">
                Image URL
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('imageUrl')} />
              </label>
              <ImageUploader folder="categories" onUploaded={(image) => setValue('imageUrl', image.url)} />
              <label className="block text-sm font-medium">
                Display Order
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="0" {...register('displayOrder')} />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" {...register('isActive')} />
                Active category
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={isSubmitting}>
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </button>
              {editingCategory && (
                <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold">Categories</h2>
            </div>
            {status === 'loading' ? (
              <p className="p-5 text-sm text-slate-600">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="p-5 text-sm text-slate-600">No categories found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Active</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {categories.map((category) => (
                      <tr key={category._id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-950">{category.name}</div>
                          <div className="text-xs text-slate-500">{category.description || 'No description'}</div>
                        </td>
                        <td className="px-4 py-3">{category.displayOrder}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium" onClick={() => startEdit(category)}>Edit</button>
                            <button
                              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium"
                              onClick={() => dispatch(updateCategoryStatus({ id: category._id, isActive: !category.isActive }))}
                            >
                              {category.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700" onClick={() => dispatch(deleteCategory(category._id))}>Delete</button>
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
