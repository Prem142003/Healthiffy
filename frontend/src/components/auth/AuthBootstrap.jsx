import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshSession } from '../../redux/slices/authSlice';

export const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const { hasCheckedSession, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!hasCheckedSession && !isAuthenticated) {
      dispatch(refreshSession());
    }
  }, [dispatch, hasCheckedSession, isAuthenticated]);

  return children;
};
