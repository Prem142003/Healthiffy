import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/authApi';

export const ChangePassword = () => {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    const response = await authApi.changePassword(values);
    setMessage(response.data.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Change Password</h1>
      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      <label className="block text-sm font-medium">
        Current Password
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" {...register('currentPassword', { required: true })} />
      </label>
      <label className="block text-sm font-medium">
        New Password
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" {...register('newPassword', { required: true, minLength: 8 })} />
      </label>
      <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white" disabled={isSubmitting}>
        Change Password
      </button>
    </form>
  );
};
