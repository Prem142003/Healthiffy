import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../../redux/slices/authSlice';
import { authApi } from '../../services/authApi';

export const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm();
  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { isSubmitting: isDeleting }
  } = useForm();

  const onSubmit = async (values) => {
    const response = await authApi.changePassword(values);
    setMessage(response.data.message);
  };

  const onDeleteAccount = async ({ currentPassword }) => {
    setDeleteError('');
    const result = await dispatch(deleteAccount({ currentPassword }));

    if (deleteAccount.fulfilled.match(result)) {
      navigate('/', { replace: true });
      return;
    }

    setDeleteError(result.payload || 'Unable to delete your account.');
  };

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Account Settings</h1>
        <h2 className="font-semibold">Change Password</h2>
        {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        <label className="block text-sm font-medium">
          Current Password
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" autoComplete="current-password" {...register('currentPassword', { required: true })} />
        </label>
        <label className="block text-sm font-medium">
          New Password
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" type="password" autoComplete="new-password" {...register('newPassword', { required: true, minLength: 8 })} />
        </label>
        <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-60" disabled={isSubmitting}>
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>

      <section className="rounded-lg border border-red-200 bg-white p-6">
        <h2 className="font-semibold text-red-800">Delete Account</h2>
        <p className="mt-2 text-sm text-slate-600">
          This permanently deletes your account, cart, and active sessions. Your completed order records are retained.
        </p>

        {!showDeleteConfirmation ? (
          <button
            className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
            onClick={() => setShowDeleteConfirmation(true)}
            type="button"
          >
            Delete my account
          </button>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={handleDeleteSubmit(onDeleteAccount)}>
            {deleteError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</p>}
            <label className="block text-sm font-medium">
              Enter your current password to confirm
              <input
                className="mt-1 w-full rounded-md border border-red-300 px-3 py-2"
                type="password"
                autoComplete="current-password"
                {...registerDelete('currentPassword', { required: true, minLength: 8 })}
              />
            </label>
            <div className="flex gap-3">
              <button
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={isDeleting}
                type="submit"
              >
                {isDeleting ? 'Deleting...' : 'Permanently delete'}
              </button>
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setDeleteError('');
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};
