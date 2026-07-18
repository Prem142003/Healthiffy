import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../services/authApi';

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    const response = await authApi.resetPassword({
      email: params.get('email'),
      token: params.get('token'),
      password: values.password
    });
    setMessage(response.data.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="text-xl font-semibold">Reset Password</h1>
      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      <label className="block text-sm font-medium">
        New Password
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" {...register('password', { required: true, minLength: 8 })} />
      </label>
      <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white" disabled={isSubmitting}>
        Reset Password
      </button>
      <Link className="text-sm text-emerald-700" to="/login">Back to login</Link>
    </form>
  );
};
