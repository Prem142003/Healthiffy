import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';

const getDashboardPath = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'WORKER') return '/worker';
  return '/';
};

export const StaffLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      navigate(location.state?.from?.pathname || getDashboardPath(result.payload.user.role), { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#925e06]">Team access</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold tracking-tight">Staff sign in</h1>
        <p className="mt-2 text-base text-slate-600">Secure access for Healthiffy administrators and branch workers.</p>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <label className="block text-sm font-medium">
        Email
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="email" {...register('email', { required: true })} />
      </label>

      <label className="block text-sm font-medium">
        Password
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" {...register('password', { required: true })} />
      </label>

      <button className="w-full rounded-full bg-emerald-700 px-4 py-3.5 font-bold text-white shadow-md transition-colors hover:bg-emerald-800 disabled:opacity-60" disabled={status === 'loading'}>
        {status === 'loading' ? 'Logging in...' : 'Login'}
      </button>

      <Link className="inline-flex text-base font-bold text-emerald-700" to="/login">Customer Google login</Link>
    </form>
  );
};
