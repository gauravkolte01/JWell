import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supplierAPI } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { supplierAPI.dashboard().then(r => setStats(r.data)).catch(() => {}); }, []);

  const cards = stats ? [
    { title: 'Total Orders', value: stats.total_orders, color: 'from-primary-500 to-primary-600' },
    { title: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Accepted', value: stats.accepted, color: 'from-blue-500 to-blue-600' },
    { title: 'Preparing', value: stats.preparing, color: 'from-purple-500 to-purple-600' },
    { title: 'Dispatched', value: stats.dispatched, color: 'from-green-500 to-green-600' },
    { title: 'Received', value: stats.received, color: 'from-gray-500 to-gray-600' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Supplier Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats ? cards.map(({ title, value, color }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <div className={`h-1 w-full bg-gradient-to-r ${color} rounded-full mt-3`} />
          </motion.div>
        )) : [...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
