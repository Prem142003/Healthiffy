import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BranchSelector } from '../../components/customer/BranchSelector';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import { MenuCard } from '../../components/customer/MenuCard';
import { logoutUser } from '../../redux/slices/authSlice';
import { addCartItem, fetchCart } from '../../redux/slices/cartSlice';
import { branchApi } from '../../services/branchApi';
import { categoryApi } from '../../services/categoryApi';
import { menuItemApi } from '../../services/menuItemApi';

export const CustomerHome = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [branchResponse, categoryResponse] = await Promise.all([
          branchApi.getPublicBranches({ limit: 100, sort: 'name' }),
          categoryApi.getPublicCategories({ limit: 100, sort: 'displayOrder name' })
        ]);

        const activeBranches = branchResponse.data.data.branches;
        setBranches(activeBranches);
        setCategories(categoryResponse.data.data.categories);
        setSelectedBranchId((current) => current || activeBranches[0]?._id || '');
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load customer menu.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setMenuItems([]);
      return;
    }

    const loadMenu = async () => {
      try {
        setMenuLoading(true);
        const response = await menuItemApi.getPublicMenuItems({
          branch: selectedBranchId,
          category: selectedCategoryId || undefined,
          search: search || undefined,
          foodType: foodType || undefined,
          limit: 100,
          sort: 'name'
        });
        setMenuItems(response.data.data.menuItems);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load menu items.');
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, [selectedBranchId, selectedCategoryId, search, foodType]);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch._id === selectedBranchId),
    [branches, selectedBranchId]
  );

  const addItemToCart = async (item) => {
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      setError('Please login before adding items to cart.');
      return;
    }

    const result = await dispatch(addCartItem({ menuItem: item._id, quantity: 1 }));

    if (addCartItem.fulfilled.match(result)) {
      setSuccess(`${item.name} added to cart.`);
      return;
    }

    setError(result.payload || 'Unable to add item to cart.');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="text-2xl font-semibold text-emerald-700">Healthiffy</Link>
          <nav className="flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{user?.name}</span>
                <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium" to="/checkout">Cart {cart?.items?.length ? `(${cart.items.length})` : ''}</Link>
                <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium" to="/my-orders">Orders</Link>
                <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium" to="/change-password">Password</Link>
                <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch(logoutUser())} type="button">Logout</button>
              </>
            ) : (
              <>
                <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium" to="/login">Login</Link>
                <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white" to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Fresh cafe ordering</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-950">Choose your branch and browse today&apos;s menu.</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Branches, categories, and menu items are loaded dynamically from Healthiffy admin data.
            </p>
          </div>
          {selectedBranch && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-950">{selectedBranch.name}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedBranch.address}</div>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span>{selectedBranch.openingTime} - {selectedBranch.closingTime}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${selectedBranch.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {selectedBranch.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        {loading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading Healthiffy...</p>
        ) : branches.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No active branches are available right now.</p>
        ) : (
          <>
            <section className="mb-6 space-y-4">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-950">Select Branch</h2>
                <BranchSelector branches={branches} selectedBranchId={selectedBranchId} onSelectBranch={(branchId) => {
                  setSelectedBranchId(branchId);
                  setSelectedCategoryId('');
                }} />
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Search food or tags"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={foodType}
                  onChange={(event) => setFoodType(event.target.value)}
                >
                  <option value="">All food types</option>
                  <option value="VEG">Veg</option>
                  <option value="NON_VEG">Non Veg</option>
                </select>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-950">Categories</h2>
                <CategoryTabs categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-950">Menu</h2>
                {menuLoading && <span className="text-sm text-slate-500">Refreshing...</span>}
              </div>

              {menuItems.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No menu items match this selection.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {menuItems.map((item) => (
                    <MenuCard key={item._id} item={item} onOrder={addItemToCart} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
};
