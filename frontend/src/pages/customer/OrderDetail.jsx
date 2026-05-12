import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { HiCheck, HiOutlineTruck, HiOutlineClock } from 'react-icons/hi';

const steps = [
  { id: 'pending', label: 'Order Placed' },
  { id: 'confirmed', label: 'Payment Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' }
];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id)
      .then(res => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <div className="page-container px-4 max-w-5xl mx-auto"><div className="skeleton h-96 rounded-2xl mt-8" /></div>;
  if (!order) return <div className="page-container text-center text-gray-400 mt-20">Order not found</div>;

  const currentStepIdx = steps.findIndex(s => s.id === order.order_status);
  const isCancelled = order.order_status === 'cancelled';
  const isReturned = order.order_status === 'returned';

  return (
    <div className="page-container px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="section-title mt-4 mb-2">Order <span className="gradient-text">#{order.id}</span></h1>
        <p className="text-gray-500 mb-8">{new Date(order.order_date).toLocaleString()}</p>

        {/* Tracking Timeline */}
        {!(isCancelled || isReturned) ? (
          <div className="card p-6 md:p-10 mb-8 overflow-x-auto">
            <div className="min-w-[600px] flex justify-between relative">
              {/* Connecting Line */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-dark-500 rounded" />
              <div 
                className="absolute top-5 left-8 h-1 bg-primary-500 transition-all duration-700 ease-in-out rounded" 
                style={{ width: `calc(${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}% - 4rem)` }} 
              />
              
              {/* Steps */}
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center w-24">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-dark-700 transition-colors duration-500 ${
                      isCompleted ? 'bg-primary-500 text-dark-900' : 'bg-dark-500 text-gray-400'
                    }`}>
                      {isCompleted ? <HiCheck className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-xs mt-3 font-medium text-center ${
                      isCurrent ? 'text-primary-400' : isCompleted ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {/* Timestamp Hints */}
                    {step.id === 'pending' && <span className="text-[10px] text-gray-500 mt-1">{new Date(order.order_date).toLocaleDateString()}</span>}
                    {step.id === 'shipped' && order.shipped_at && <span className="text-[10px] text-gray-500 mt-1">{new Date(order.shipped_at).toLocaleDateString()}</span>}
                    {step.id === 'delivered' && order.delivered_at && <span className="text-[10px] text-gray-500 mt-1">{new Date(order.delivered_at).toLocaleDateString()}</span>}
                  </div>
                );
              })}
            </div>
            
            {order.order_status === 'shipped' && order.tracking_number && (
              <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center gap-4">
                <HiOutlineTruck className="w-6 h-6 text-primary-400" />
                <div>
                  <p className="text-sm text-primary-400 font-medium">Your order is on the way!</p>
                  <p className="text-xs text-gray-400 mt-1">Tracking Number: <span className="text-white font-mono">{order.tracking_number}</span></p>
                </div>
              </div>
            )}
            
            {order.order_status === 'pending' && order.payment_status === 'pending' && (
              <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-4">
                <HiOutlineClock className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-yellow-400 font-medium">Awaiting Payment</p>
                  <p className="text-xs text-gray-400 mt-1">Please complete your payment to confirm this order.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-6 mb-8 text-center bg-red-500/10 border-red-500/20">
            <h2 className="text-xl font-bold text-red-400 capitalize mb-2">Order {order.order_status}</h2>
            <p className="text-gray-400">This order has been {order.order_status} and will not be fulfilled.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-dark-800 rounded-lg">
                  {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg" />}
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">{fmt(item.product_price)} × {item.quantity}</p>
                  </div>
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
                <hr className="border-dark-500 my-2" />
                <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="gradient-text">{fmt(order.total_amount)}</span></div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-3">Shipping Address</h3>
              <p className="text-gray-300 text-sm">{order.shipping_address}</p>
              {order.shipping_city && <p className="text-gray-300 text-sm">{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>}
              
              {order.payment_status && (
                <div className="mt-4 pt-4 border-t border-dark-600">
                  <h3 className="text-white font-semibold mb-2">Payment Status</h3>
                  <span className={`px-2 py-1 text-xs rounded font-medium capitalize ${
                    order.payment_status === 'success' ? 'bg-green-500/20 text-green-400' :
                    order.payment_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
