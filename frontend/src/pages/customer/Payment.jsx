import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentSettings, submitManualPayment } from '../../redux/slices/paymentSlice';
import { ImageUploader } from '../../components/common/ImageUploader';
import { initializeCashfree } from '../../services/cashfree';
import { paymentApi } from '../../services/paymentApi';

const getApiError = (error) =>
  error.response?.data?.message || error.message || 'Unable to process payment.';

export const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { settings, status, error } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [transactionReference, setTransactionReference] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [success, setSuccess] = useState('');
  const [cashfreeMessage, setCashfreeMessage] = useState('');
  const [cashfreeState, setCashfreeState] = useState('idle');
  const cashfreeRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPaymentSettings());
  }, [dispatch]);

  useEffect(() => {
    if (user?.phone) setCustomerPhone(user.phone);
  }, [user?.phone]);

  useEffect(() => {
    if (!settings?.cashfree?.enabled) return;
    try {
      cashfreeRef.current = initializeCashfree(settings.cashfree.environment);
    } catch (sdkError) {
      setCashfreeMessage(sdkError.message);
    }
  }, [settings?.cashfree?.enabled, settings?.cashfree?.environment]);

  const verifyCashfreePayment = async () => {
    setCashfreeState('verifying');
    setCashfreeMessage('Checking the payment securely...');
    const response = await paymentApi.getCashfreeStatus(orderId);
    const result = response.data.data;

    if (result.status === 'PAID') {
      setCashfreeState('paid');
      setCashfreeMessage('Payment confirmed. Thank you!');
      navigate(`/orders/${orderId}/track`);
      return result.status;
    }

    if (result.status === 'PROCESSING') {
      setCashfreeState('processing');
      setCashfreeMessage('Payment is still processing. You can check again shortly.');
      return result.status;
    }

    setCashfreeState('failed');
    setCashfreeMessage('Payment was not confirmed. Please retry or use manual UPI.');
    return result.status;
  };

  const startCashfreePayment = async () => {
    try {
      setCashfreeState('creating');
      setCashfreeMessage('Creating a secure payment session...');

      const response = await paymentApi.createCashfreeSession(orderId, {
        customerPhone
      });
      const session = response.data.data;
      const cashfree = cashfreeRef.current;
      if (!cashfree) throw new Error('Cashfree checkout is still loading. Please retry.');
      setCashfreeState('checkout');
      setCashfreeMessage('');

      const result = await cashfree.checkout({
        paymentSessionId: session.paymentSessionId,
        redirectTarget: '_modal'
      });

      if (result.redirect) return;

      if (result.error) {
        const verifiedStatus = await verifyCashfreePayment();
        if (verifiedStatus !== 'PAID') {
          setCashfreeMessage('Payment was not completed. You can safely retry.');
        }
        return;
      }

      if (result.paymentDetails) {
        await verifyCashfreePayment();
        return;
      }

      await verifyCashfreePayment();
    } catch (paymentError) {
      setCashfreeState('failed');
      setCashfreeMessage(getApiError(paymentError));
    }
  };

  const submitPayment = async () => {
    setSuccess('');
    const result = await dispatch(submitManualPayment({
      orderId,
      payload: { transactionReference, screenshotUrl, customerNote }
    }));

    if (submitManualPayment.fulfilled.match(result)) {
      setSuccess('Payment submitted for verification.');
      setTimeout(() => navigate(`/orders/${orderId}/track`), 900);
    }
  };

  const cashfreeBusy = ['creating', 'checkout', 'verifying'].includes(cashfreeState);
  const manualEnabled = settings?.isEnabled && settings?.upiId;

  return (
    <main className="customer-mobile-page min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="mobile-page-heading flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Payment</p>
            <h1 className="text-3xl font-semibold text-slate-950">Pay for your order</h1>
          </div>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/my-orders">Orders</Link>
        </div>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        {status === 'loading' && !settings ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading payment options...</p>
        ) : (
          <>
            <section className="payment-option-card rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Recommended</p>
                <h2 className="text-xl font-semibold text-slate-950">Cashfree UPI or Card</h2>
                <p className="mt-1 text-sm text-slate-600">Pay securely through Cashfree. Healthiffy never receives your card number, CVV, UPI PIN, or OTP.</p>
              </div>

              {!settings?.cashfree?.enabled ? (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">Cashfree checkout is not configured yet. Use manual UPI below.</p>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Mobile number
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                      inputMode="numeric"
                      maxLength={13}
                      placeholder="10-digit mobile number"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                    />
                  </label>
                  {cashfreeMessage && (
                    <p className={`rounded-md px-3 py-2 text-sm ${
                      cashfreeState === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : cashfreeState === 'failed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}>
                      {cashfreeMessage}
                    </p>
                  )}
                  <button
                    className="payment-primary-action w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={cashfreeBusy}
                    onClick={startCashfreePayment}
                    type="button"
                  >
                    {cashfreeBusy ? 'Please wait...' : 'Pay securely'}
                  </button>
                  {cashfreeState === 'processing' && (
                    <button
                      className="payment-secondary-action w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium"
                      onClick={verifyCashfreePayment}
                      type="button"
                    >
                      Check payment status
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="payment-option-card rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Fallback</p>
                <h2 className="text-xl font-semibold text-slate-950">Manual UPI verification</h2>
              </div>

              {!manualEnabled ? (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">Manual UPI payment is not configured.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    {settings.qrCode?.url ? (
                      <img className="aspect-square w-full rounded-md object-cover" src={settings.qrCode.url} alt="UPI QR code" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-md bg-white px-4 text-center text-sm text-slate-500">QR not uploaded</div>
                    )}
                    <div className="mt-3 break-all text-center text-sm font-semibold">{settings.upiId}</div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">
                      Transaction reference
                      <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={transactionReference} onChange={(event) => setTransactionReference(event.target.value)} />
                    </label>
                    <ImageUploader folder="payment-screenshots" onUploaded={(image) => setScreenshotUrl(image.url)} />
                    <label className="block text-sm font-medium">
                      Note
                      <textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} />
                    </label>
                    <button className="payment-primary-action w-full rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800" onClick={submitPayment} type="button">
                      I&apos;ve paid manually
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
};
