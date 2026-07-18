import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

export const Home = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-emerald-800">Healthiffy Authentication</h1>
      <p className="mt-3 text-slate-600">Authentication module is ready. Business modules are intentionally not built yet.</p>

      <div className="mt-6 flex gap-3">
        {isAuthenticated ? (
          <>
            <span className="rounded-md bg-white px-4 py-2 text-sm shadow-sm">Signed in as {user?.name}</span>
            <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" to="/change-password">Change Password</Link>
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" onClick={() => dispatch(logoutUser())}>Logout</button>
          </>
        ) : (
          <>
            <Link className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" to="/login">Login</Link>
            <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/register">Register</Link>
          </>
        )}
      </div>
    </main>
  );
};
