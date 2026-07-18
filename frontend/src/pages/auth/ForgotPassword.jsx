import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';

export const ForgotPassword = () => {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    const response = await authApi.forgotPassword(values);
    setMessage(response.data.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="text-xl font-semibold">Forgot Password</h1>
      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      <label className="block text-sm font-medium">
        Email
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="email" {...register('email', { required: true })} />
      </label>
      <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white" disabled={isSubmitting}>
        Send Reset Link
      </button>
      <Link className="text-sm text-emerald-700" to="/login">Back to login</Link>
    </form>
  );
};
