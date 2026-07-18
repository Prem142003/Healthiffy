import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentSettings, submitManualPayment } from '../../redux/slices/paymentSlice';
import { ImageUploader } from '../../components/common/ImageUploader';

export const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { settings, status, error } = useSelector((state) => state.payments);
  const [transactionReference, setTransactionReference] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchPaymentSettings());
  }, [dispatch]);

  const submitPayment = async () => {
    setSuccess('');
    const result = await dispatch(submitManualPayment({
      orderId,
      payload: { transactionReference, screenshotUrl, customerNote }
    }));

    if (submitManualPayment.fulfilled.match(result)) {
      setSuccess('Payment submitted for manual verification.');
      setTimeout(() => navigate('/my-orders'), 900);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">UPI Payment</p>
            <h1 className="text-3xl font-semibold text-slate-950">Scan QR or Pay UPI</h1>
          </div>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/my-orders">Orders</Link>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        {status === 'loading' && !settings ? (
          <p className="text-sm text-slate-600">Loading payment details...</p>
        ) : !settings?.isEnabled || !settings?.upiId ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">UPI payment is not configured yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[240px_1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              {settings.qrCode?.url ? (
                <img className="aspect-square w-full rounded-md object-cover" src={settings.qrCode.url} alt="UPI QR code" />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-md bg-white px-4 text-center text-sm text-slate-500">QR not uploaded</div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">UPI ID</div>
                <div className="mt-1 rounded-md bg-slate-100 px-3 py-2 font-semibold text-slate-950">{settings.upiId}</div>
              </div>
              <label className="block text-sm font-medium">
                Transaction Reference
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={transactionReference} onChange={(event) => setTransactionReference(event.target.value)} />
              </label>
              <label className="block text-sm font-medium">
                Screenshot URL
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={screenshotUrl} onChange={(event) => setScreenshotUrl(event.target.value)} />
              </label>
              <ImageUploader folder="payment-screenshots" onUploaded={(image) => setScreenshotUrl(image.url)} />
              <label className="block text-sm font-medium">
                Note
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} />
              </label>
              <button className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" onClick={submitPayment} type="button">
                I Have Paid
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
