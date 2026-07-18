import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['Dashboard', '/admin'],
  ['Branches', '/admin/branches'],
  ['Categories', '/admin/categories'],
  ['Menu', '/admin/menu'],
  ['Orders', '/admin/orders'],
  ['Payments', '/admin/payments'],
  ['Payment Settings', '/admin/payment-settings'],
  ['Users', '/admin/users'],
  ['Workers', '/admin/workers'],
  ['Settings', '/admin/settings']
];

export const AdminLayout = () => (
  <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="px-4 py-5">
        <div className="text-xl font-semibold text-emerald-700">Healthiffy</div>
        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Admin</div>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible">
        {links.map(([label, path]) => (
          <NavLink
            key={path}
            className={({ isActive }) =>
              `block shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
            end={path === '/admin'}
            to={path}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <div className="min-w-0">
      <Outlet />
    </div>
  </div>
);
