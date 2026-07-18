import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ImageUploader } from '../../components/common/ImageUploader';
import { fetchPaymentSettings, updatePaymentSettings } from '../../redux/slices/paymentSlice';

export const PaymentSettings = () => {
  const dispatch = useDispatch();
  const { settings, status, error } = useSelector((state) => state.payments);
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { upiId: '', qrCodeUrl: '', isEnabled: true }
  });

  useEffect(() => {
    dispatch(fetchPaymentSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      reset({
        upiId: settings.upiId || '',
        qrCodeUrl: settings.qrCode?.url || '',
        isEnabled: settings.isEnabled
      });
    }
  }, [settings, reset]);

  const onSubmit = (values) => {
    dispatch(updatePaymentSettings({
      upiId: values.upiId,
      qrCodeUrl: values.qrCodeUrl,
      isEnabled: Boolean(values.isEnabled)
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">UPI And QR Settings</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium">
            UPI ID
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('upiId')} />
          </label>
          <label className="block text-sm font-medium">
            QR Code URL
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register('qrCodeUrl')} />
          </label>
          <ImageUploader folder="payment-qr" onUploaded={(image) => setValue('qrCodeUrl', image.url)} />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" {...register('isEnabled')} />
            Enable manual UPI payment
          </label>
          <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" disabled={status === 'loading'}>
            Save Settings
          </button>
        </form>
      </section>
    </main>
  );
};
