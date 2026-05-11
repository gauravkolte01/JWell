import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors = { pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger', returned: 'badge-danger' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [filter]);
  const fetchOrders = () => {
    const params = filter ? { order_status: filter } : {};
    orderAPI.adminList(params).then(res => setOrders(res.data.results || res.data)).finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    try { await orderAPI.adminUpdateStatus(id, { order_status: status }); toast.success('Updated!'); fetchOrders(); } catch { toast.error('Failed'); }
  };

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
        <select className="input-field w-40" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? <div className="skeleton h-96 rounded-xl" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>{['Order', 'Customer', 'Date', 'Total', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-dark-700/50">
                    <td className="px-4 py-3 text-white font-medium">#{o.id}</td>
                    <td className="px-4 py-3"><p className="text-white text-sm">{o.customer_name}</p><p className="text-xs text-gray-500">{o.customer_email}</p></td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{new Date(o.order_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-white font-medium">{fmt(o.total_amount)}</td>
                    <td className="px-4 py-3"><span className={statusColors[o.order_status]}>{o.order_status}</span></td>
                    <td className="px-4 py-3">
                      <select className="bg-dark-800 border border-dark-500 rounded px-2 py-1 text-sm text-white" value={o.order_status} onChange={e => updateStatus(o.id, e.target.value)}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
