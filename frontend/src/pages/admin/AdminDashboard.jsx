import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardAnalytics } from '../../redux/slices/analyticsSlice';

const formatCurrency = (value) => `₹${Math.round(value || 0).toLocaleString('en-IN')}`;

const StatCard = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
  </div>
);

const BarChart = ({ data, labelKey, valueKey }) => {
  const max = Math.max(...data.map((item) => item[valueKey] || 0), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item._id || item[labelKey]}>
          <div className="mb-1 flex justify-between text-xs text-slate-600">
            <span>{item[labelKey] || item._id}</span>
            <span>{formatCurrency(item[valueKey])}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-emerald-700" style={{ width: `${Math.max(((item[valueKey] || 0) / max) * 100, 4)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { summary, revenue, branchRevenue, bestSellingItems, status, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Dashboard</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {['branches', 'categories', 'menu', 'orders', 'payments', 'users', 'workers'].map((path) => (
              <Link key={path} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium capitalize" to={`/admin/${path}`}>{path}</Link>
            ))}
          </nav>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {status === 'loading' && !summary ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading analytics...</p>
        ) : summary && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Today Revenue" value={formatCurrency(summary.todayRevenue)} />
              <StatCard label="Weekly Revenue" value={formatCurrency(summary.weeklyRevenue)} />
              <StatCard label="Monthly Revenue" value={formatCurrency(summary.monthlyRevenue)} />
              <StatCard label="Average Order Value" value={formatCurrency(summary.averageOrderValue)} />
              <StatCard label="Total Orders" value={summary.totalOrders} />
              <StatCard label="Completed Orders" value={summary.completedOrders} />
              <StatCard label="Pending Orders" value={summary.pendingOrders} />
              <StatCard label="Cancelled Orders" value={summary.cancelledOrders} />
              <StatCard label="Paid Orders" value={summary.paidOrders} />
              <StatCard label="Unpaid Orders" value={summary.unpaidOrders} />
              <StatCard label="Customers" value={summary.totalCustomers} />
              <StatCard label="Workers" value={summary.totalWorkers} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-950">Revenue Graph</h2>
                <BarChart data={revenue} labelKey="_id" valueKey="revenue" />
              </section>
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-950">Branch-wise Revenue</h2>
                <BarChart data={branchRevenue} labelKey="branchName" valueKey="revenue" />
              </section>
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold text-slate-950">Best Selling Items</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {bestSellingItems.map((item) => (
                    <div key={item._id} className="rounded-md border border-slate-200 p-3">
                      <div className="font-medium text-slate-950">{item._id}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.quantity} sold · {formatCurrency(item.revenue)}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
};
