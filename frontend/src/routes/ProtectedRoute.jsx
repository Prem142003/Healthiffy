import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { hasCheckedSession, isAuthenticated, status } = useSelector((state) => state.auth);

  if (!hasCheckedSession || status === 'loading') {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Restoring your session...
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
