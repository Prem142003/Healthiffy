import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-slate-600">Access your Healthiffy account.</p>
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

      <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-60" disabled={status === 'loading'}>
        {status === 'loading' ? 'Logging in...' : 'Login'}
      </button>

      <div className="flex justify-between text-sm">
        <Link className="text-emerald-700" to="/register">Create account</Link>
        <Link className="text-emerald-700" to="/forgot-password">Forgot password?</Link>
      </div>
    </form>
  );
};
