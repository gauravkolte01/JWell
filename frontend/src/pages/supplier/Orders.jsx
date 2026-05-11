import { useState, useEffect } from 'react';
import { supplierAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = { pending: 'badge-warning', accepted: 'badge-info', rejected: 'badge-danger', preparing: 'badge-info', dispatched: 'badge-success', received: 'badge-success' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, [filter]);
  const fetch = () => {
    const params = filter ? { status: filter } : {};
    supplierAPI.getOrders(params).then(r => setOrders(r.data.results || r.data)).finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    try { await supplierAPI.updateOrder(id, { status }); toast.success('Updated!'); fetch(); } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const getActions = (order) => {
    switch (order.status) {
      case 'pending': return [{ label: 'Accept', status: 'accepted', color: 'btn-primary' }, { label: 'Reject', status: 'rejected', color: 'btn-danger' }];
      case 'accepted': return [{ label: 'Start Preparing', status: 'preparing', color: 'btn-primary' }];
      case 'preparing': return [{ label: 'Dispatch', status: 'dispatched', color: 'btn-primary' }];
      default: return [];
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Incoming Orders</h1>
        <select className="input-field w-40" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          {['pending', 'accepted', 'preparing', 'dispatched'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="skeleton h-96 rounded-xl" /> : orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No orders</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                  {o.product_image && <img src={o.product_image} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                  <div>
                    <p className="text-white font-medium">{o.product_name}</p>
                    <p className="text-sm text-gray-400">Qty: {o.quantity} | Unit: {fmt(o.unit_cost)} | Total: {fmt(o.total_cost)}</p>
                    <p className="text-xs text-gray-500">{new Date(o.purchase_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusColors[o.status]}>{o.status}</span>
                  {getActions(o).map(a => (
                    <button key={a.status} onClick={() => updateStatus(o.id, a.status)} className={`${a.color} text-sm px-3 py-1.5`}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
