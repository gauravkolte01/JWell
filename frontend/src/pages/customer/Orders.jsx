import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../../services/api';

const statusColors = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger', returned: 'badge-danger',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll().then(res => setOrders(res.data.results || res.data)).finally(() => setLoading(false));
  }, []);

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="page-container px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="section-title mb-8 mt-4">My <span className="gradient-text">Orders</span></h1>
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center"><p className="text-gray-400 mb-4">No orders yet</p><Link to="/products" className="btn-primary">Start Shopping</Link></div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/orders/${order.id}`} className="card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 block">
                  <div>
                    <p className="text-white font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={statusColors[order.order_status] || 'badge-info'}>{order.order_status}</span>
                    <span className="text-white font-bold">{fmt(order.total_amount)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
