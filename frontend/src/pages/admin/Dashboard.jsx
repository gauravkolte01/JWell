import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCurrencyRupee, HiShoppingCart, HiCube, HiUsers, HiExclamation } from 'react-icons/hi';
import { orderAPI, productAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    orderAPI.adminDashboard().then(res => setStats(res.data)).catch(() => {});
    productAPI.getLowStock().then(res => setLowStock(res.data)).catch(() => {});
  }, []);

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const cards = stats ? [
    { title: 'Total Revenue', value: fmt(stats.total_revenue), icon: HiCurrencyRupee, color: 'from-primary-500 to-primary-600' },
    { title: 'Monthly Revenue', value: fmt(stats.monthly_revenue), icon: HiCurrencyRupee, color: 'from-green-500 to-green-600' },
    { title: 'Total Orders', value: stats.total_orders, icon: HiShoppingCart, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Products', value: stats.total_products, icon: HiCube, color: 'from-purple-500 to-purple-600' },
    { title: 'Customers', value: stats.total_customers, icon: HiUsers, color: 'from-secondary-500 to-secondary-600' },
    { title: 'Pending Orders', value: stats.pending_orders, icon: HiExclamation, color: 'from-yellow-500 to-yellow-600' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats ? cards.map(({ title, value, icon: Icon, color }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        )) : [...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary-500 text-sm">View All</Link>
          </div>
          <div className="space-y-3">
            {stats?.recent_orders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">#{order.id} — {order.customer_name}</p>
                  <p className="text-xs text-gray-500">{new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{fmt(order.total_amount)}</p>
                  <span className={`text-xs capitalize ${order.order_status === 'delivered' ? 'text-green-400' : order.order_status === 'pending' ? 'text-yellow-400' : 'text-blue-400'}`}>{order.order_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">⚠️ Low Stock Alerts</h2>
            <span className="badge-warning">{lowStock.length} items</span>
          </div>
          <div className="space-y-3">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                <p className="text-white text-sm">{p.name}</p>
                <span className={`font-bold text-sm ${p.stock_quantity === 0 ? 'text-red-400' : 'text-yellow-400'}`}>{p.stock_quantity} left</span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-gray-500 text-sm">All products are well stocked!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
