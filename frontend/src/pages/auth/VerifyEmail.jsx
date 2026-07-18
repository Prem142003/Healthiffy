import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../services/authApi';

export const VerifyEmail = () => {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      setMessage('Verification link is missing required information.');
      return;
    }

    authApi.verifyEmail({ token, email })
      .then(() => setMessage('Email verified successfully. You can now login.'))
      .catch((error) => setMessage(error.response?.data?.message || 'Verification failed.'));
  }, [params]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Email Verification</h1>
      <p className="text-sm text-slate-700">{message}</p>
      <Link className="inline-block rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" to="/login">Go to Login</Link>
    </div>
  );
};
