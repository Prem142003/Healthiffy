import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, ClipboardList, Leaf, LogOut, MapPin, ShoppingBag, Store, UserRound } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import { fetchPublicBranches, selectCustomerBranch } from '../../redux/slices/branchSlice';

const customerLinks = [
  { label: 'Home', to: '/', icon: Store, end: true },
  { label: 'Orders', to: '/my-orders', icon: ClipboardList },
  { label: 'Monthly plans', to: '/monthly-plans', icon: CalendarDays }
];

const workerLinks = [
  { label: 'Branch operations', to: '/worker', icon: ClipboardList, end: true }
];

export const AuthenticatedHeader = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { customerBranches, customerStatus, selectedCustomerBranchId } = useSelector((state) => state.branches);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER' && customerStatus === 'idle') {
      dispatch(fetchPublicBranches());
    }
  }, [customerStatus, dispatch, isAuthenticated, user?.role]);

  if (!isAuthenticated || !user || user.role === 'ADMIN') return null;

  const links = user.role === 'WORKER' ? workerLinks : customerLinks;
  const cartCount = (cart?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);

  return (
    <header className="authenticated-header sticky top-0 z-[70] border-b border-[#ede383]/10 text-[#ede383] backdrop-blur-xl">
      <div className="authenticated-header__inner mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
        <Link to={user.role === 'WORKER' ? '/worker' : '/'} className="flex shrink-0 items-center gap-2.5" aria-label="Healthiffy home">
          <span className="flex h-10 w-10 items-center justify-center rounded-[50%_50%_50%_12px] bg-[#8da432] text-[#351903] shadow-lg"><Leaf size={20} /></span>
          <span className="hidden min-[430px]:block">
            <strong className="font-heading block text-lg font-black tracking-[-0.04em] text-[#ede383]">HEALTHIFFY</strong>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-[#ede383]/75 sm:block">{user.role === 'WORKER' ? 'Branch operations' : 'Pure veg cafe'}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={`${user.role.toLowerCase()} navigation`}>
          {links.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-colors ${isActive ? 'bg-[#8da432] text-[#351903]' : 'text-[#ede383]/75 hover:bg-[#8da432]/20 hover:text-[#ede383]'}`}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
          {user.role === 'CUSTOMER' && (
            <Link to="/checkout" className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold ${location.pathname === '/checkout' ? 'bg-[#8da432] text-[#351903]' : 'border border-[#ede383]/15 bg-[#ede383]/5 text-[#ede383]'}`}>
              <ShoppingBag size={16} /> Cart {cartCount > 0 && <span className="rounded-full bg-[#925e06] px-2 py-0.5 text-xs text-[#ede383]">{cartCount}</span>}
            </Link>
          )}
        </nav>

        {user.role === 'CUSTOMER' ? (
          <label className="relative flex min-w-0 items-center text-[#8da432]">
            <MapPin className="pointer-events-none absolute left-3" size={16} aria-hidden="true" />
            <span className="sr-only">Ordering branch</span>
            <select
              className="h-11 w-[clamp(8.5rem,16vw,12rem)] appearance-none truncate rounded-full border border-[#ede383]/15 bg-[#ede383]/5 py-2 pl-9 pr-7 text-sm font-bold text-[#ede383] outline-none transition-colors hover:bg-[#8da432]/20 focus:border-[#8da432]"
              value={selectedCustomerBranchId}
              onChange={(event) => dispatch(selectCustomerBranch(event.target.value))}
              disabled={customerStatus === 'loading' || customerBranches.length === 0}
            >
              {customerBranches.length === 0 ? <option value="">Select branch</option> : null}
              {customerBranches.map((branch) => <option className="text-[#351903]" value={branch._id} key={branch._id}>{branch.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5" size={14} aria-hidden="true" />
          </label>
        ) : null}

        {user.role === 'CUSTOMER' ? (
          <Link to="/checkout" className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#ede383]/15 bg-[#ede383]/5 text-[#ede383] lg:hidden" aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag size={18} />
            {cartCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#925e06] px-1 text-[10px] font-bold text-[#ede383]">{cartCount}</span> : null}
          </Link>
        ) : null}

        {user.role === 'CUSTOMER' ? <div className="relative hidden md:block">
          <button type="button" onClick={() => setAccountOpen((open) => !open)} className="flex h-11 items-center gap-2 rounded-full border border-[#ede383]/15 bg-[#ede383]/5 p-1 pr-2.5 text-left transition-colors hover:bg-[#8da432]/20" aria-expanded={accountOpen} aria-controls="authenticated-account-menu">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8da432] text-[#351903]"><UserRound size={18} /></span>
            <span className="hidden min-w-0 xl:block"><strong className="block max-w-32 truncate text-sm">{user.name}</strong><span className="block max-w-32 truncate text-[11px] text-[#ede383]/55">{user.assignedBranch?.name || user.email}</span></span>
            <ChevronDown size={15} className={`text-[#8da432] transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
          </button>
          {accountOpen ? (
            <div id="authenticated-account-menu" className="absolute right-0 top-[calc(100%+0.7rem)] w-64 overflow-hidden rounded-2xl border border-[#ede383]/10 bg-[#163a29] p-2 text-[#ede383] shadow-2xl">
              <div className="border-b border-[#ede383]/10 px-3 py-3"><strong className="block truncate text-sm">{user.name}</strong><span className="block truncate text-xs text-[#ede383]/55">{user.email}</span></div>
              <Link className="mt-2 flex min-h-11 items-center rounded-xl px-3 text-sm font-bold hover:bg-[#8da432]/20" to="/my-orders">My orders</Link>
              <Link className="flex min-h-11 items-center rounded-xl px-3 text-sm font-bold hover:bg-[#8da432]/20" to="/monthly-plans">Monthly plans</Link>
              <Link className="flex min-h-11 items-center rounded-xl px-3 text-sm font-bold hover:bg-[#8da432]/20" to="/my-subscription">My subscription</Link>
              <button type="button" onClick={() => dispatch(logoutUser())} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-bold text-[#e7b7a2] hover:bg-[#8da432]/20"><LogOut size={16} /> Log out</button>
            </div>
          ) : null}
        </div> : (
          <div className="hidden items-center gap-3 sm:flex">
            <div className="hidden max-w-52 items-center gap-2 lg:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8da432] text-[#351903]"><UserRound size={18} /></span>
              <span className="min-w-0"><strong className="block truncate text-sm">{user.name}</strong><span className="block truncate text-xs text-[#ede383]/55">{user.assignedBranch?.name || user.email}</span></span>
            </div>
            <button type="button" onClick={() => dispatch(logoutUser())} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#ede383]/15 px-4 text-sm font-bold text-[#ede383]/75 transition-colors hover:bg-[#8da432]/20 hover:text-[#ede383]"><LogOut size={17} /><span className="hidden lg:inline">Log out</span></button>
          </div>
        )}
      </div>
    </header>
  );
};
