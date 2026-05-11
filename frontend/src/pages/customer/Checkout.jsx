import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { orderAPI, paymentAPI } from '../../services/api';
import { fetchCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function Checkout() {
  const dispatch = useDispatch();
  const { items, totalPrice, loading: cartLoading } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ shipping_address: '', shipping_city: '', shipping_state: '', shipping_zip: '', notes: '' });

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  // Fetch fresh cart data on mount
  useEffect(() => {
    dispatch(fetchCart()).then((result) => {
      setReady(true);
      const cartData = result.payload;
      if (!cartData?.items?.length) {
        toast.error('Your cart is empty');
        navigate('/cart');
      }
    });
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shipping_address.trim()) {
      return toast.error('Please enter a shipping address');
    }
    if (items.length === 0) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const { data: order } = await orderAPI.create(form);
      toast.success('Order created!');
      try {
        const { data: payment } = await paymentAPI.createCheckout(order.id);
        if (payment.checkout_url) {
          window.location.href = payment.checkout_url;
        } else {
          navigate(`/orders/${order.id}`);
        }
      } catch (payErr) {
        // Payment creation failed (e.g. Stripe not configured), but order exists
        toast.error('Payment gateway error. Order created — you can pay later.');
        navigate(`/orders/${order.id}`);
      }
    } catch (err) {
      const errData = err.response?.data;
      const message = typeof errData === 'object'
        ? errData.error || errData.shipping_address?.[0] || JSON.stringify(errData)
        : 'Failed to create order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching cart
  if (!ready || cartLoading) {
    return (
      <div className="page-container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="skeleton h-96 rounded-2xl mt-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="section-title mb-8 mt-4">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Shipping Information</h2>
            <div>
              <label className="input-label">Address *</label>
              <textarea className="input-field" rows="2" required value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} placeholder="Full shipping address" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="input-label">City</label><input className="input-field" value={form.shipping_city} onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} placeholder="City" /></div>
              <div><label className="input-label">State</label><input className="input-field" value={form.shipping_state} onChange={(e) => setForm({ ...form, shipping_state: e.target.value })} placeholder="State" /></div>
              <div><label className="input-label">ZIP</label><input className="input-field" value={form.shipping_zip} onChange={(e) => setForm({ ...form, shipping_zip: e.target.value })} placeholder="ZIP Code" /></div>
            </div>
            <div><label className="input-label">Notes (optional)</label><textarea className="input-field" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Special instructions" /></div>
          </div>

          <div className="card p-6 h-fit">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm"><span className="text-gray-400 line-clamp-1 flex-1">{item.product?.name} × {item.quantity}</span><span className="text-white ml-2">{fmt(item.subtotal)}</span></div>
              ))}
            </div>
            <hr className="border-dark-500 mb-4" />
            <div className="flex justify-between text-white font-bold text-lg mb-6"><span>Total</span><span className="gradient-text">{fmt(totalPrice)}</span></div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
              {loading ? <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : 'Pay with Stripe'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">Secured by Stripe. 256-bit encryption.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
