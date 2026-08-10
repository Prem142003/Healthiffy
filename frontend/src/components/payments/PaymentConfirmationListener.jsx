import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchMe } from '../../redux/slices/authSlice';
import { disconnectSocket, getSocket } from '../../services/socket';

const notificationMessage = (role, payload) => {
  if (role === 'ADMIN') {
    return `${payload.orderNumber}: Rs. ${payload.amount} received from ${payload.customer?.name || 'customer'}.`;
  }
  if (role === 'WORKER') {
    return `${payload.orderNumber}: payment of Rs. ${payload.amount} confirmed.`;
  }
  return `Payment confirmed for ${payload.orderNumber}. Thank you!`;
};

export const PaymentConfirmationListener = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken || !user?._id) {
      disconnectSocket();
      return undefined;
    }

    const socket = getSocket(accessToken);
    const handleConfirmation = (payload) => {
      toast.success(notificationMessage(user.role, payload));

      if (user.role === 'CUSTOMER') {
        dispatch(fetchMe());
      }

      window.dispatchEvent(
        new CustomEvent('healthiffy:payment-confirmed', {
          detail: payload
        })
      );
    };

    const handleSubscriptionActivated = () => {
      toast.success(user.role === 'CUSTOMER' ? 'Your monthly subscription is active.' : 'A monthly subscription was activated.');
      window.dispatchEvent(new CustomEvent('healthiffy:subscription-updated'));
    };

    const handleSubscriptionDelivered = () => {
      if (user.role === 'CUSTOMER') toast.success("Today's meal was marked delivered.");
      window.dispatchEvent(new CustomEvent('healthiffy:subscription-updated'));
    };

    socket.on('payment:confirmed', handleConfirmation);
    socket.on('subscription:activated', handleSubscriptionActivated);
    socket.on('subscription:delivered', handleSubscriptionDelivered);
    socket.connect();

    return () => {
      socket.off('payment:confirmed', handleConfirmation);
      socket.off('subscription:activated', handleSubscriptionActivated);
      socket.off('subscription:delivered', handleSubscriptionDelivered);
    };
  }, [accessToken, dispatch, user?._id, user?.role]);

  return null;
};
