import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import RecentOrders from '../../components/customer/dashboard/RecentOrders';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import { MenuCard } from '../../components/customer/MenuCard';
import { MenuItemSheet } from '../../components/customer/MenuItemSheet';
import { addCartItem, fetchCart, removeCartItem, updateCartItem } from '../../redux/slices/cartSlice';
import { categoryApi } from '../../services/categoryApi';
import { menuItemApi } from '../../services/menuItemApi';
import { orderApi } from '../../services/orderApi';
import { PublicLanding } from '../public/PublicLanding';
import './CustomerDashboard.css';

const getApiMessage = (error, fallback) => error.response?.data?.message || fallback;

const AuthenticatedCustomerHome = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const {
    customerBranches: branches,
    customerStatus: branchStatus,
    customerError: branchError,
    selectedCustomerBranchId: selectedBranchId
  } = useSelector((state) => state.branches);
  const isCustomer = user?.role === 'CUSTOMER';

  const [categories, setCategories] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [bestsellersOnly, setBestsellersOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(isCustomer);
  const [pageError, setPageError] = useState('');
  const [menuError, setMenuError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

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

  useEffect(() => {
    if (isAuthenticated && isCustomer) dispatch(fetchCart());
  }, [dispatch, isAuthenticated, isCustomer]);

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      setPageError('');
      try {
        const response = await categoryApi.getPublicCategories({ limit: 100, sort: 'displayOrder name' });
        setCategories(response.data.data.categories || []);
      } catch (error) {
        setPageError(getApiMessage(error, 'Menu categories are temporarily unavailable.'));
      }
      setInitialLoading(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    loadRecentOrders();

    window.addEventListener('healthiffy:payment-confirmed', loadRecentOrders);
    return () => {
      window.removeEventListener('healthiffy:payment-confirmed', loadRecentOrders);
    };
  }, [loadRecentOrders]);

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
          foodType: 'VEG',
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
    setSelectedCategoryId('');
    setBestsellersOnly(false);
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
      const matchesBestseller = !bestsellersOnly || item.isBestseller;
      const searchableText = [item.name, item.description, ...(item.tags || [])].join(' ').toLowerCase();
      return matchesCategory && matchesBestseller && (!term || searchableText.includes(term));
    });
  }, [allMenuItems, bestsellersOnly, selectedCategoryId, search]);

  const cartCount = useMemo(
    () => (cart?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cart]
  );

  const cartQuantities = useMemo(() => new Map(
    (cart?.items || []).map((item) => [String(item.menuItem?._id || item.menuItem), Number(item.quantity || 0)])
  ), [cart]);

  const addItemToCart = async (item, quantity = 1) => {
    const result = await dispatch(addCartItem({ menuItem: item._id, quantity }));
    if (addCartItem.fulfilled.match(result)) {
      setNotice(`${item.name} was added to your cart.`);
    } else {
      setNotice(result.payload || 'We could not add that item to your cart.');
    }
  };

  const changeCartQuantity = async (item, change) => {
    const currentQuantity = cartQuantities.get(String(item._id)) || 0;
    const nextQuantity = currentQuantity + change;
    const result = nextQuantity <= 0
      ? await dispatch(removeCartItem(item._id))
      : await dispatch(updateCartItem({ menuItemId: item._id, quantity: nextQuantity }));
    if (result.meta.requestStatus === 'rejected') {
      setNotice(result.payload || 'We could not update your cart.');
    }
  };

  return (
    <main className="customer-app customer-dashboard">
      <div className="customer-dashboard__container customer-dashboard__intro">
        <WelcomeSection name={user?.name} branchName={selectedBranch?.name} cartCount={cartCount} />
      </div>

      <section id="menu" className="customer-menu" aria-labelledby="full-menu-title">
        <div className="customer-menu__inner">
          <div className="dashboard-section__heading customer-menu__heading">
            <div>
              <p className="dashboard-eyebrow">Made fresh at your cafe</p>
              <h2 id="full-menu-title">{selectedBranch?.name || 'Healthiffy'} menu</h2>
            </div>
            <label className="customer-search customer-search--header">
              <span className="sr-only">Search menu</span>
              <input type="search" placeholder="Search dishes or ingredients" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>

          {(pageError || branchError) ? <div className="dashboard-alert dashboard-alert--error">{pageError || branchError}</div> : null}
          {notice ? <div className="dashboard-alert" role="status">{notice}</div> : null}

          {initialLoading || branchStatus === 'loading' ? (
            <div className="customer-menu-grid" aria-label="Loading menu">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div className="dashboard-skeleton dashboard-skeleton--menu" key={item} />)}
            </div>
          ) : branches.length === 0 ? (
            <p className="dashboard-inline-message">No active branches are available right now.</p>
          ) : (
            <>
              <div className="customer-menu__controls">
                <div className="customer-filter-group">
                  <CategoryTabs
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={(categoryId) => {
                      setSelectedCategoryId(categoryId);
                      setBestsellersOnly(false);
                    }}
                    bestsellersOnly={bestsellersOnly}
                    onToggleBestsellers={() => {
                      setSelectedCategoryId('');
                      setBestsellersOnly((current) => !current);
                    }}
                  />
                </div>
                <p className="customer-menu__count">{filteredMenuItems.length} item{filteredMenuItems.length === 1 ? '' : 's'}</p>
              </div>

              {menuError ? <div className="dashboard-alert dashboard-alert--error">{menuError}</div> : null}
              {menuLoading ? (
                <div className="customer-menu-grid" aria-label="Loading menu items">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div className="dashboard-skeleton dashboard-skeleton--menu" key={item} />)}
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <p className="dashboard-inline-message">No menu items match your current filters.</p>
              ) : (
                <div className="customer-menu-grid">
                  {filteredMenuItems.map((item) => (
                    <MenuCard
                      key={item._id}
                      item={item}
                      quantity={cartQuantities.get(String(item._id)) || 0}
                      onOrder={addItemToCart}
                      onOpen={setSelectedMenuItem}
                      onIncrease={(menuItem) => changeCartQuantity(menuItem, 1)}
                      onDecrease={(menuItem) => changeCartQuantity(menuItem, -1)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {isCustomer ? (
        <section className="customer-activity" aria-label="Your recent activity">
          <div className="customer-dashboard__container">
            <RecentOrders orders={recentOrders} loading={ordersLoading} error={ordersError} onRetry={loadRecentOrders} />
          </div>
        </section>
      ) : null}

      <footer className="customer-footer"><div><strong>HEALTHIFFY</strong><span>Pure veg cafe · {selectedBranch?.name || 'Choose your branch'}</span><Link to="/my-orders">Order history</Link><Link to="/monthly-plans">Monthly plans</Link></div></footer>
      {cartCount > 0 ? (
        <Link className="mobile-cart-summary" to="/checkout">
          <span><strong>{cartCount}</strong> item{cartCount === 1 ? '' : 's'}</span>
          <strong>Rs. {Number(cart?.subtotal || 0).toFixed(0)}</strong>
          <span>View cart &#8594;</span>
        </Link>
      ) : null}
      <MenuItemSheet item={selectedMenuItem} onClose={() => setSelectedMenuItem(null)} onAdd={addItemToCart} />
    </main>
  );
};

export const CustomerHome = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <AuthenticatedCustomerHome /> : <PublicLanding />;
};
