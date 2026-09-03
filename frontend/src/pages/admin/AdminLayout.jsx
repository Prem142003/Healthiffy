import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Gauge,
  Leaf,
  LogOut,
  MenuSquare,
  ReceiptIndianRupee,
  Settings,
  Tags,
  Truck,
  UserCog,
  Users
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';

const links = [
  { label: 'Dashboard', path: '/admin', icon: Gauge },
  { label: 'Branches', path: '/admin/branches', icon: Building2 },
  { label: 'Categories', path: '/admin/categories', icon: Tags },
  { label: 'Menu', path: '/admin/menu', icon: MenuSquare },
  { label: 'Monthly Plans', path: '/admin/subscription-plans', icon: CalendarDays },
  { label: 'Monthly Customers', path: '/admin/monthly-customers', icon: Users },
  { label: 'Meal Deliveries', path: '/admin/subscription-deliveries', icon: Truck },
  { label: 'Subscription Analytics', path: '/admin/subscription-analytics', icon: BarChart3 },
  { label: 'Orders', path: '/admin/orders', icon: ClipboardCheck },
  { label: 'Payments', path: '/admin/payments', icon: ReceiptIndianRupee },
  { label: 'Payment Settings', path: '/admin/payment-settings', icon: CreditCard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Workers', path: '/admin/workers', icon: UserCog },
  { label: 'Settings', path: '/admin/settings', icon: Settings }
];

export const AdminLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const currentLabel = [...links]
    .sort((left, right) => right.path.length - left.path.length)
    .find(({ path }) => location.pathname === path || location.pathname.startsWith(`${path}/`))?.label || 'Dashboard';

  return (
    <div className="admin-shell min-h-screen bg-slate-50 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#ede383]/10 bg-[#365004] text-[#ede383] lg:flex">
        <div className="flex items-center gap-3 border-b border-[#ede383]/10 px-6 py-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8da432] text-[#351903]"><Leaf size={22} /></span>
          <span><strong className="font-heading block text-xl font-black tracking-tight">HEALTHIFFY</strong><small className="font-bold uppercase tracking-[0.16em] text-[#ede383]">Admin console</small></span>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5" aria-label="Admin navigation">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${isActive ? 'bg-[#8da432] text-[#351903]' : 'text-[#ede383]/75 hover:bg-[#8da432]/20 hover:text-[#ede383]'}`}
              end={path === '/admin'}
              to={path}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#ede383]/10 p-4">
          <div className="mb-3 px-3"><strong className="block truncate text-sm">{user?.name || 'Administrator'}</strong><span className="block truncate text-xs text-[#ede383]/55">{user?.email}</span></div>
          <button type="button" onClick={() => dispatch(logoutUser())} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ede383]/15 px-4 py-3 text-sm font-bold text-[#ede383] transition-colors hover:bg-[#8da432]/20"><LogOut size={17} /> Log out</button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="admin-mobile-header sticky top-0 z-[70] flex min-h-20 items-center justify-between gap-3 border-b border-[#351903]/10 bg-[#f7f0b1]/95 px-4 backdrop-blur-xl lg:hidden">
          <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#365004] text-[#ede383]"><Leaf size={20} /></span><span className="min-w-0"><strong className="font-heading block truncate text-lg">Healthiffy Admin</strong><span className="block truncate text-xs text-[#351903]/60">{currentLabel}</span></span></div>
          <NavLink className="inline-flex h-11 items-center gap-2 rounded-full border border-[#351903]/15 px-4 text-sm font-bold" to="/admin/settings"><Settings size={17} /> <span className="hidden sm:inline">Settings</span></NavLink>
        </header>
        <nav className="sticky top-20 z-[60] hidden gap-2 overflow-x-auto border-b border-[#351903]/10 bg-[#f7f0b1] px-4 py-3 md:flex lg:hidden" aria-label="Admin tablet navigation">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} end={path === '/admin'} to={path} className={({ isActive }) => `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${isActive ? 'bg-[#8da432] text-[#351903]' : 'border border-[#351903]/10 text-[#351903]'}`}><Icon size={16} /> {label}</NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
};
