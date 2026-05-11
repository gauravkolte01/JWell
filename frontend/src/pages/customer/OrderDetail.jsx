import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../../services/api';

const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id).then(res => setOrder(res.data)).finally(() => setLoading(false));
  }, [id]);

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <div className="page-container px-4 max-w-5xl mx-auto"><div className="skeleton h-96 rounded-2xl mt-8" /></div>;
  if (!order) return <div className="page-container text-center text-gray-400">Order not found</div>;

  const currentStep = steps.indexOf(order.order_status);

  return (
    <div className="page-container px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="section-title mt-4 mb-2">Order <span className="gradient-text">#{order.id}</span></h1>
        <p className="text-gray-500 mb-8">{new Date(order.order_date).toLocaleString()}</p>

        {/* Progress */}
        {!['cancelled', 'returned'].includes(order.order_status) && (
          <div className="card p-6 mb-8">
            <div className="flex justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-500" />
              <div className="absolute top-4 left-0 h-0.5 bg-primary-500 transition-all" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
              {steps.map((s, i) => (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? 'bg-primary-500 text-dark-900' : 'bg-dark-500 text-gray-400'}`}>{i + 1}</div>
                  <span className={`text-xs mt-2 capitalize ${i <= currentStep ? 'text-primary-500' : 'text-gray-500'}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-dark-800 rounded-lg">
                  <img src={item.product_image || 'https://images.unsplash.com/photo-1515562141589-67f0d569b507?w=100&q=80'} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1"><p className="text-white font-medium">{item.product_name}</p><p className="text-sm text-gray-500">{fmt(item.product_price)} × {item.quantity}</p></div>
                  <p className="text-white font-medium">{fmt(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">{fmt(order.total_amount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="text-green-400">Free</span></div>
                <hr className="border-dark-500" />
                <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="gradient-text">{fmt(order.total_amount)}</span></div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-3">Shipping</h3>
              <p className="text-gray-400 text-sm">{order.shipping_address}</p>
              {order.shipping_city && <p className="text-gray-400 text-sm">{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>}
              {order.tracking_number && <p className="text-sm mt-2"><span className="text-gray-500">Tracking:</span> <span className="text-primary-500">{order.tracking_number}</span></p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
