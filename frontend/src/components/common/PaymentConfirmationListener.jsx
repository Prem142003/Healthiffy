import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchMe } from '../../redux/slices/authSlice';
import { disconnectSocket, getSocket } from '../../services/socket';

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

export const PaymentConfirmationListener = () => {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user?._id) {
      disconnectSocket();
      return undefined;
    }

    const socket = getSocket(accessToken);
    const handleConfirmation = (confirmation) => {
      window.dispatchEvent(
        new CustomEvent('healthiffy:payment-confirmed', { detail: confirmation })
      );
      const amount = formatAmount(confirmation.amount);
      if (user.role === 'ADMIN') {
        toast.success(
          `Payment confirmed: ${amount} from ${confirmation.customer?.name} for ${confirmation.orderNumber}.`
        );
      } else if (user.role === 'WORKER') {
        toast.success(`Payment confirmed for ${confirmation.orderNumber}: ${amount}.`);
      } else {
        toast.success(`Your ${amount} payment for ${confirmation.orderNumber} is confirmed.`);
        if (confirmation.customer?._id === user._id) {
          dispatch(fetchMe());
        }
      }
    };

    socket.on('payment:confirmed', handleConfirmation);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off('payment:confirmed', handleConfirmation);
    };
  }, [accessToken, dispatch, isAuthenticated, user?._id, user?.role]);

  return null;
};
