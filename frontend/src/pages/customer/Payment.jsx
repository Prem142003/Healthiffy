import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentSettings, submitManualPayment } from '../../redux/slices/paymentSlice';
import { ImageUploader } from '../../components/common/ImageUploader';
import { getCashfree } from '../../services/cashfree';
import { orderApi } from '../../services/orderApi';
import { paymentApi } from '../../services/paymentApi';

const extractError = (error) =>
  error.response?.data?.message || error.message || 'Unable to process payment. Please try again.';

export const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { settings, status, error: settingsError } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [checkoutState, setCheckoutState] = useState('idle');
  const [message, setMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [transactionReference, setTransactionReference] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    dispatch(fetchPaymentSettings());
    orderApi
      .getOrder(orderId)
      .then((response) => setOrder(response.data.data.order))
      .catch((apiError) => setPaymentError(extractError(apiError)));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!settings?.cashfree?.enabled) return;
    try {
      getCashfree(settings.cashfree.mode);
    } catch (sdkError) {
      setPaymentError(sdkError.message);
    }
  }, [settings?.cashfree?.enabled, settings?.cashfree?.mode]);

  const isBusy = checkoutState === 'creating' || checkoutState === 'verifying';
  const isPaid = order?.paymentStatus === 'PAID' || checkoutState === 'paid';
  const formattedAmount = useMemo(
    () => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order?.totalAmount || 0),
    [order?.totalAmount]
  );

  const verifyWithBackend = async () => {
    setCheckoutState('verifying');
    setMessage('Confirming your payment securely...');
    const response = await paymentApi.verifyCashfreePayment(orderId);
    const verification = response.data.data.verification;

    if (verification.paid) {
      setCheckoutState('paid');
      setMessage('Payment confirmed. Your order is now paid.');
      setOrder((current) => ({ ...current, paymentStatus: 'PAID' }));
      setTimeout(() => navigate(`/orders/${orderId}/track`), 1000);
      return;
    }

    setCheckoutState('idle');
    setMessage(
      verification.status === 'ACTIVE'
        ? 'Payment is still pending. You can check again or retry checkout.'
        : `Payment was not completed (${verification.status}). You can try again.`
    );
  };

  const startCashfreeCheckout = async () => {
    setPaymentError('');
    setMessage('');
    setCheckoutState('creating');

    try {
      const response = await paymentApi.createCashfreeSession(orderId, { customerPhone });
      const session = response.data.data.session;
      const cashfree = getCashfree(session.mode);
      const result = await cashfree.checkout({
        paymentSessionId: session.paymentSessionId,
        redirectTarget: '_modal'
      });

      if (result.error) {
        setCheckoutState('idle');
        setMessage('Payment was not completed. No charge is confirmed; you can safely retry.');
        return;
      }

      if (result.redirect) {
        return;
      }

      if (result.paymentDetails) {
        await verifyWithBackend();
        return;
      }

      setCheckoutState('idle');
      setMessage('Checkout closed without a confirmed payment.');
    } catch (checkoutError) {
      setCheckoutState('idle');
      setPaymentError(extractError(checkoutError));
    }
  };

  const submitManual = async () => {
    setMessage('');
    const result = await dispatch(
      submitManualPayment({
        orderId,
        payload: { transactionReference, screenshotUrl, customerNote }
      })
    );

    if (submitManualPayment.fulfilled.match(result)) {
      setMessage('Payment submitted for manual verification.');
      setTimeout(() => navigate(`/orders/${orderId}/track`), 900);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Secure checkout</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">Pay for your order</h1>
            {order && <p className="mt-2 text-sm text-slate-600">{order.orderNumber} · {formattedAmount}</p>}
          </div>
          <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium" to="/my-orders">
            View orders
          </Link>
        </div>

        {(settingsError || paymentError) && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {paymentError || settingsError}
          </p>
        )}
        {message && (
          <p className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            isPaid
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}>
            {message}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">Cashfree Payments</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">UPI or debit/credit card</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Choose UPI or card inside Cashfree&apos;s secure checkout. Your card details never pass through Healthiffy.
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold uppercase text-emerald-800">
                {settings?.cashfree?.mode || 'sandbox'}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-950">UPI</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">Pay through a UPI app, QR, or test VPA.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-950">Cards</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">Visa, Mastercard, and RuPay debit or credit cards.</p>
              </div>
            </div>

            <label className="mt-6 block text-sm font-medium text-slate-800">
              Mobile number
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                inputMode="numeric"
                maxLength={13}
                placeholder="10-digit mobile number"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
              />
            </label>

            <button
              className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy || isPaid || !order || !settings?.cashfree?.enabled}
              onClick={startCashfreeCheckout}
              type="button"
            >
              {checkoutState === 'creating'
                ? 'Opening secure checkout...'
                : checkoutState === 'verifying'
                  ? 'Confirming payment...'
                  : isPaid
                    ? 'Payment confirmed'
                    : `Pay ${formattedAmount}`}
            </button>

            {order?.paymentStatus === 'PROCESSING' && !isPaid && (
              <button
                className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
                disabled={isBusy}
                onClick={() => verifyWithBackend().catch((verifyError) => {
                  setCheckoutState('idle');
                  setPaymentError(extractError(verifyError));
                })}
                type="button"
              >
                Check payment status
              </button>
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Order total</p>
            <div className="mt-2 text-3xl font-semibold">{formattedAmount}</div>
            <div className="mt-5 border-t border-slate-700 pt-4 text-xs leading-5 text-slate-300">
              Payment is confirmed only after Healthiffy verifies the final status directly with Cashfree.
            </div>
          </aside>
        </div>

        {settings?.isEnabled && settings?.upiId && !isPaid && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <button
              className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-800"
              onClick={() => setShowManual((current) => !current)}
              type="button"
            >
              <span>Manual UPI fallback</span>
              <span aria-hidden="true">{showManual ? '−' : '+'}</span>
            </button>

            {showManual && (
              <div className="mt-5 grid gap-6 border-t border-slate-200 pt-5 md:grid-cols-[200px_1fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {settings.qrCode?.url ? (
                    <img className="aspect-square w-full rounded-md object-cover" src={settings.qrCode.url} alt="UPI QR code" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-center text-xs text-slate-500">QR not uploaded</div>
                  )}
                  <div className="mt-3 break-all text-center text-sm font-semibold">{settings.upiId}</div>
                </div>
                <div className="space-y-3">
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Transaction reference"
                    value={transactionReference}
                    onChange={(event) => setTransactionReference(event.target.value)}
                  />
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Screenshot URL"
                    value={screenshotUrl}
                    onChange={(event) => setScreenshotUrl(event.target.value)}
                  />
                  <ImageUploader folder="payment-screenshots" onUploaded={(image) => setScreenshotUrl(image.url)} />
                  <textarea
                    className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Optional note"
                    value={customerNote}
                    onChange={(event) => setCustomerNote(event.target.value)}
                  />
                  <button className="w-full rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700" onClick={submitManual} type="button">
                    Submit for manual verification
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {status === 'loading' && !settings && (
          <p className="mt-4 text-center text-sm text-slate-500">Loading payment options...</p>
        )}
      </section>
    </main>
  );
};
