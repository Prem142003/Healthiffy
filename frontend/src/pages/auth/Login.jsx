import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { googleLoginUser } from '../../redux/slices/authSlice';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleError('');
    const result = await dispatch(googleLoginUser({ credential: credentialResponse.credential }));
    if (googleLoginUser.fulfilled.match(result)) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#925e06]">Customer account</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold tracking-tight">Welcome to Healthiffy</h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">Sign in securely with Google to order from your branch and manage meal plans.</p>
      </div>

      {(error || googleError) && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error || googleError}</p>}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setGoogleError('Google login could not be completed. Please try again.')}
          text="continue_with"
          shape="rectangular"
          width="100%"
        />
      </div>

      {status === 'loading' && <p className="text-sm text-slate-600">Signing you in...</p>}

      <div className="border-t border-slate-200 pt-5 text-base text-slate-600">
        Admin or worker? <Link className="font-medium text-emerald-700" to="/staff-login">Use staff login</Link>
      </div>
    </div>
  );
};
