import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkoutCart,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem
} from '../../redux/slices/cartSlice';
import { fetchPaymentSettings } from '../../redux/slices/paymentSlice';

const instructionOptions = [
  'Less Sugar',
  'Extra Sugar',
  'No Sugar',
  'Less Spicy',
  'Medium Spicy',
  'Extra Spicy',
  'Extra Cheese',
  'No Onion',
  'Extra Ice',
  'Less Ice'
];

export const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, status, error } = useSelector((state) => state.cart);
  const { settings: paymentSettings } = useSelector((state) => state.payments);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchPaymentSettings());
  }, [dispatch]);

  const submitCheckout = async () => {
    setSuccess('');
    const result = await dispatch(checkoutCart({ specialInstructions }));
    if (checkoutCart.fulfilled.match(result)) {
      const order = result.payload.order;
      const isCounterPayment = order.payment?.method === 'PAY_AT_COUNTER';
      setSuccess(
        isCounterPayment
          ? `Order ${order.orderNumber} placed. Payment is pending at the counter.`
          : `Order ${order.orderNumber} placed successfully.`
      );
      setTimeout(
        () => navigate(isCounterPayment ? `/orders/${order._id}/track` : `/payment/${order._id}`),
        800
      );
    }
  };

  const toggleInstruction = (instruction) => {
    const current = specialInstructions
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const next = current.includes(instruction)
      ? current.filter((item) => item !== instruction)
      : [...current, instruction];
    setSpecialInstructions(next.join(', '));
  };

  const counterOnly = paymentSettings?.customerPaymentMode === 'PAY_AT_COUNTER';

  return (
    <main className="customer-mobile-page min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mobile-page-heading mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Customer</p>
            <h1 className="text-3xl font-semibold text-slate-950">Checkout</h1>
          </div>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/">Browse Menu</Link>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        {status === 'loading' && !cart ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading cart...</p>
        ) : !cart || cart.items.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Your cart is empty.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              {cart.items.map((item) => (
                <article key={item.menuItem?._id || item.menuItem} className="checkout-item rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="checkout-item__row flex gap-4">
                    <div className="checkout-item__image h-20 w-20 shrink-0 rounded-md bg-slate-100">
                      {item.imageSnapshot && <img className="h-full w-full rounded-md object-cover" src={item.imageSnapshot} alt={item.nameSnapshot} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-slate-950">{item.nameSnapshot}</h2>
                      <p className="text-sm text-slate-600">₹{item.offerPriceSnapshot ?? item.priceSnapshot}</p>
                      <div className="checkout-quantity-controls mt-3 flex flex-wrap items-center gap-2">
                        <button
                          className="checkout-quantity-button rounded-md border border-slate-300 px-3 py-1 text-sm"
                          onClick={() => dispatch(updateCartItem({ menuItemId: item.menuItem?._id || item.menuItem, quantity: Math.max(item.quantity - 1, 1) }))}
                          type="button"
                        >
                          -
                        </button>
                        <span className="checkout-quantity-value w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          className="checkout-quantity-button rounded-md border border-slate-300 px-3 py-1 text-sm"
                          onClick={() => dispatch(updateCartItem({ menuItemId: item.menuItem?._id || item.menuItem, quantity: item.quantity + 1 }))}
                          type="button"
                        >
                          +
                        </button>
                        <button
                          className="checkout-remove-action rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-700"
                          onClick={() => dispatch(removeCartItem(item.menuItem?._id || item.menuItem))}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="checkout-item__total text-sm font-semibold text-slate-950">
                      ₹{(item.offerPriceSnapshot ?? item.priceSnapshot) * item.quantity}
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="checkout-summary h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Summary</h2>
              <div className="mt-3 text-sm text-slate-600">{cart.branch?.name}</div>
              <label className="mt-4 block text-sm font-medium">
                Special Instructions
                <div className="mt-2 flex flex-wrap gap-2">
                  {instructionOptions.map((instruction) => (
                    <button
                      key={instruction}
                      className={`checkout-instruction-chip rounded-full border px-3 py-1 text-xs font-medium ${
                        specialInstructions.includes(instruction)
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                          : 'border-slate-300 text-slate-700'
                      }`}
                      onClick={() => toggleInstruction(instruction)}
                      type="button"
                    >
                      {instruction}
                    </button>
                  ))}
                </div>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Add a custom note, or select options above"
                  value={specialInstructions}
                  onChange={(event) => setSpecialInstructions(event.target.value)}
                />
              </label>
              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-semibold">
                <span>Total</span>
                <span>₹{cart.subtotal}</span>
              </div>
              {counterOnly && (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="text-sm font-semibold text-emerald-950">Pay at Counter</div>
                  <p className="mt-1 text-sm text-emerald-800">
                    Pay at your branch counter. A worker will verify the payment there.
                  </p>
                </div>
              )}
              <button
                className="checkout-summary__submit mt-4 min-h-14 w-full rounded-md bg-emerald-700 px-4 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={status === 'loading'}
                onClick={submitCheckout}
                type="button"
              >
                {counterOnly ? 'PLACE ORDER — PAY AT COUNTER' : 'Place Order'}
              </button>
              <button className="checkout-clear-action mt-2 w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" onClick={() => dispatch(clearCart())} type="button">
                Clear Cart
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
};
