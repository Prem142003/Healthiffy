import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BranchSelector } from '../../components/customer/BranchSelector';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import DashboardHeader from '../../components/customer/dashboard/DashboardHeader';
import BranchSpotlight from '../../components/customer/dashboard/BranchSpotlight';
import PopularMenu from '../../components/customer/dashboard/PopularMenu';
import QuickActions from '../../components/customer/dashboard/QuickActions';
import RecentOrders from '../../components/customer/dashboard/RecentOrders';
import SubscriptionSummary from '../../components/customer/dashboard/SubscriptionSummary';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import { MenuCard } from '../../components/customer/MenuCard';
import { logoutUser } from '../../redux/slices/authSlice';
import { addCartItem, fetchCart } from '../../redux/slices/cartSlice';
import { branchApi } from '../../services/branchApi';
import { categoryApi } from '../../services/categoryApi';
import { menuItemApi } from '../../services/menuItemApi';
import { orderApi } from '../../services/orderApi';
import { subscriptionApi } from '../../services/subscriptionApi';
import { PublicLanding } from '../public/PublicLanding';
import './CustomerDashboard.css';

const getApiMessage = (error, fallback) => error.response?.data?.message || fallback;

const AuthenticatedCustomerHome = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const isCustomer = user?.role === 'CUSTOMER';

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(isCustomer);
  const [subscriptionLoading, setSubscriptionLoading] = useState(isCustomer);
  const [pageError, setPageError] = useState('');
  const [menuError, setMenuError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [subscriptionError, setSubscriptionError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRecentOrders = useCallback(async () => {
    if (!isCustomer) return;
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const response = await orderApi.getMyOrders({ limit: 3 });
      setRecentOrders(response.data.data.orders || []);
    } catch (error) {
      setOrdersError(getApiMessage(error, 'We could not load your recent orders.'));
    } finally {
      setOrdersLoading(false);
    }
  }, [isCustomer]);

  const loadSubscriptions = useCallback(async () => {
    if (!isCustomer) return;
    try {
      setSubscriptionLoading(true);
      setSubscriptionError('');
      const response = await subscriptionApi.getMySubscriptions();
      setSubscriptions(response.data.data.subscriptions || []);
    } catch (error) {
      setSubscriptionError(getApiMessage(error, 'We could not load your monthly plan.'));
    } finally {
      setSubscriptionLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isAuthenticated && isCustomer) dispatch(fetchCart());
  }, [dispatch, isAuthenticated, isCustomer]);

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      setPageError('');
      const [branchResult, categoryResult] = await Promise.allSettled([
        branchApi.getPublicBranches({ limit: 100, sort: 'name' }),
        categoryApi.getPublicCategories({ limit: 100, sort: 'displayOrder name' })
      ]);

      if (branchResult.status === 'fulfilled') {
        const activeBranches = branchResult.value.data.data.branches || [];
        setBranches(activeBranches);
        setSelectedBranchId((current) => current || activeBranches[0]?._id || '');
      } else {
        setPageError(getApiMessage(branchResult.reason, 'Branches are temporarily unavailable.'));
      }

      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value.data.data.categories || []);
      }
      setInitialLoading(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    loadRecentOrders();
    loadSubscriptions();

    window.addEventListener('healthiffy:payment-confirmed', loadRecentOrders);
    window.addEventListener('healthiffy:subscription-updated', loadSubscriptions);
    return () => {
      window.removeEventListener('healthiffy:payment-confirmed', loadRecentOrders);
      window.removeEventListener('healthiffy:subscription-updated', loadSubscriptions);
    };
  }, [loadRecentOrders, loadSubscriptions]);

  useEffect(() => {
    if (!selectedBranchId) {
      setAllMenuItems([]);
      return;
    }

    const loadMenu = async () => {
      try {
        setMenuLoading(true);
        setMenuError('');
        const response = await menuItemApi.getPublicMenuItems({
          branch: selectedBranchId,
          limit: 100,
          sort: 'name'
        });
        setAllMenuItems(response.data.data.menuItems || []);
      } catch (error) {
        setMenuError(getApiMessage(error, 'The menu is temporarily unavailable.'));
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, [selectedBranchId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch._id === selectedBranchId),
    [branches, selectedBranchId]
  );

  const filteredMenuItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allMenuItems.filter((item) => {
      const categoryId = item.category?._id || item.category;
      const matchesCategory = !selectedCategoryId || categoryId === selectedCategoryId;
      const matchesFoodType = !foodType || item.foodType === foodType;
      const searchableText = [item.name, item.description, ...(item.tags || [])].join(' ').toLowerCase();
      return matchesCategory && matchesFoodType && (!term || searchableText.includes(term));
    });
  }, [allMenuItems, selectedCategoryId, foodType, search]);

  const popularItems = useMemo(
    () => [...allMenuItems].sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller)).slice(0, 4),
    [allMenuItems]
  );

  const activeSubscription = useMemo(
    () => subscriptions.find((subscription) => subscription.status === 'ACTIVE'),
    [subscriptions]
  );

  const cartCount = useMemo(
    () => (cart?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cart]
  );

  const addItemToCart = async (item) => {
    const result = await dispatch(addCartItem({ menuItem: item._id, quantity: 1 }));
    if (addCartItem.fulfilled.match(result)) {
      setNotice(`${item.name} was added to your cart.`);
    } else {
      setNotice(result.payload || 'We could not add that item to your cart.');
    }
  };

  return (
    <main className="customer-dashboard">
      <DashboardHeader
        user={user}
        cartCount={cartCount}
        onLogout={() => dispatch(logoutUser())}
      />

      <div className="customer-dashboard__container">
        <WelcomeSection name={user?.name} branchName={selectedBranch?.name} />
        <QuickActions />
        <BranchSpotlight branch={selectedBranch} />

        {isCustomer ? (
          <div className="dashboard-two-column">
            <RecentOrders
              orders={recentOrders}
              loading={ordersLoading}
              error={ordersError}
              onRetry={loadRecentOrders}
            />
            <SubscriptionSummary
              subscription={activeSubscription}
              loading={subscriptionLoading}
              error={subscriptionError}
              onRetry={loadSubscriptions}
            />
          </div>
        ) : null}

        <PopularMenu items={popularItems} loading={menuLoading} onAdd={addItemToCart} />
      </div>

      <section id="menu" className="customer-menu" aria-labelledby="full-menu-title">
        <div className="customer-menu__inner">
          <div className="dashboard-section__heading customer-menu__heading">
            <div>
              <p className="dashboard-eyebrow">Made fresh at your cafe</p>
              <h2 id="full-menu-title">Explore the full menu</h2>
            </div>
            <p>{filteredMenuItems.length} item{filteredMenuItems.length === 1 ? '' : 's'}</p>
          </div>

          {pageError ? <div className="dashboard-alert dashboard-alert--error">{pageError}</div> : null}
          {notice ? <div className="dashboard-alert" role="status">{notice}</div> : null}

          {initialLoading ? (
            <div className="customer-menu-grid" aria-label="Loading menu">
              {[1, 2, 3, 4].map((item) => <div className="dashboard-skeleton dashboard-skeleton--menu" key={item} />)}
            </div>
          ) : branches.length === 0 ? (
            <p className="dashboard-inline-message">No active branches are available right now.</p>
          ) : (
            <>
              <div className="customer-menu__controls">
                <div id="branch-picker" className="customer-filter-group">
                  <label>Choose your branch</label>
                  <BranchSelector
                    branches={branches}
                    selectedBranchId={selectedBranchId}
                    onSelectBranch={(branchId) => {
                      setSelectedBranchId(branchId);
                      setSelectedCategoryId('');
                    }}
                  />
                </div>

                <div className="customer-filter-row">
                  <label className="customer-search">
                    <span>Search menu</span>
                    <input
                      type="search"
                      placeholder="Search dishes or ingredients"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                  <label className="customer-select">
                    <span>Food preference</span>
                    <select value={foodType} onChange={(event) => setFoodType(event.target.value)}>
                      <option value="">All food types</option>
                      <option value="VEG">Vegetarian</option>
                      <option value="NON_VEG">Non vegetarian</option>
                    </select>
                  </label>
                </div>

                <div className="customer-filter-group">
                  <label>Categories</label>
                  <CategoryTabs
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={setSelectedCategoryId}
                  />
                </div>
              </div>

              {menuError ? <div className="dashboard-alert dashboard-alert--error">{menuError}</div> : null}
              {menuLoading ? (
                <div className="customer-menu-grid" aria-label="Loading menu items">
                  {[1, 2, 3, 4].map((item) => <div className="dashboard-skeleton dashboard-skeleton--menu" key={item} />)}
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <p className="dashboard-inline-message">No menu items match your current filters.</p>
              ) : (
                <div className="customer-menu-grid">
                  {filteredMenuItems.map((item) => (
                    <MenuCard key={item._id} item={item} onOrder={addItemToCart} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export const CustomerHome = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <AuthenticatedCustomerHome /> : <PublicLanding />;
};
