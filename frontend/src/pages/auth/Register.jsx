import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slices/authSlice';

export const Register = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset, formState: { isSubmitSuccessful } } = useForm();

  const onSubmit = async (values) => {
    const result = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(result)) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Account</h1>
        <p className="mt-1 text-sm text-slate-600">We will send a verification link to your email.</p>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {isSubmitSuccessful && !error && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Registration successful. Check your email.</p>}

      <label className="block text-sm font-medium">
        Name
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('name', { required: true })} />
      </label>

      <label className="block text-sm font-medium">
        Email
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="email" {...register('email', { required: true })} />
      </label>

      <label className="block text-sm font-medium">
        Phone
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('phone')} />
      </label>

      <label className="block text-sm font-medium">
        Password
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" {...register('password', { required: true, minLength: 8 })} />
      </label>

      <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-60" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creating...' : 'Create Account'}
      </button>

      <p className="text-sm">
        Already registered? <Link className="text-emerald-700" to="/login">Login</Link>
      </p>
    </form>
  );
};
