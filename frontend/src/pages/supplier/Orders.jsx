import { useState, useEffect } from 'react';
import { supplierAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = { 
  pending: 'badge-warning', 
  accepted: 'badge-info', 
  rejected: 'badge-danger', 
  shipped: 'badge-success' 
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Ship Modal State
  const [showShipModal, setShowShipModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    supplierAPI.getOrders(params)
      .then(r => setOrders(r.data.results || r.data))
      .catch(() => toast.error("Failed to load requests"))
      .finally(() => setLoading(false));
  };

  const handleAccept = async (id) => {
    if (!window.confirm("Accept this fulfillment request?")) return;
    setActionLoading(true);
    try {
      await supplierAPI.acceptOrder(id);
      toast.success('Request accepted!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT this request? Admin will need to reassign.")) return;
    setActionLoading(true);
    try {
      await supplierAPI.rejectOrder(id);
      toast.success('Request rejected.');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const openShipModal = (id) => {
    setSelectedOrderId(id);
    setTrackingNumber('');
    setShowShipModal(true);
  };

  const submitShip = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await supplierAPI.shipOrder(selectedOrderId, { tracking_number: trackingNumber });
      toast.success('Order marked as shipped!');
      setShowShipModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark shipped');
    } finally {
      setActionLoading(false);
    }
  };

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Fulfillment Requests</h1>
        <select className="input-field w-40" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          {['pending', 'accepted', 'shipped', 'rejected'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="skeleton h-96 rounded-xl" />
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No requests found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((req, i) => (
            <motion.div 
              key={req.id} 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-6 border border-dark-600"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Request Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 text-sm">Request #{req.id} • Order #{req.order_id}</span>
                      <h2 className="text-white font-bold text-lg">Customer Delivery</h2>
                    </div>
                    <span className={statusColors[req.status]}>{req.status}</span>
                  </div>

                  {req.notes && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-sm text-yellow-500/90">
                      <strong>Admin Note:</strong> {req.notes}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-800 p-4 rounded-xl">
                    <div>
                      <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Shipping Address</span>
                      <p className="text-gray-300 text-sm mt-1">{req.shipping_address}</p>
                      <p className="text-gray-300 text-sm">{req.shipping_city}, {req.shipping_state} {req.shipping_zip}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Order Date</span>
                      <p className="text-gray-300 text-sm mt-1">{new Date(req.order_date).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2 block">Products to Fulfill</span>
                    <div className="space-y-2">
                      {req.items?.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-dark-700/50 p-2 rounded-lg">
                          {item.product_image && <img src={item.product_image} alt="" className="w-12 h-12 rounded object-cover" />}
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{item.product_name}</p>
                            <p className="text-gray-400 text-xs">{item.quantity} units</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-dark-600 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-center">
                  <div className="space-y-3">
                    {req.status === 'pending' && (
                      <>
                        <p className="text-sm text-gray-400 text-center mb-4">Please accept or reject this request.</p>
                        <button 
                          disabled={actionLoading}
                          onClick={() => handleAccept(req.id)} 
                          className="w-full btn-primary py-2"
                        >
                          Accept Order
                        </button>
                        <button 
                          disabled={actionLoading}
                          onClick={() => handleReject(req.id)} 
                          className="w-full btn-secondary py-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <>
                        <p className="text-sm text-gray-400 text-center mb-4">Prepare the order for shipping.</p>
                        <button 
                          disabled={actionLoading}
                          onClick={() => openShipModal(req.id)} 
                          className="w-full btn-primary py-2"
                        >
                          Mark as Shipped
                        </button>
                      </>
                    )}

                    {req.status === 'shipped' && (
                      <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                        <p className="text-green-400 font-bold mb-1">Shipped ✓</p>
                        <p className="text-xs text-green-500/70">{new Date(req.shipped_at).toLocaleDateString()}</p>
                      </div>
                    )}

                    {req.status === 'rejected' && (
                      <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                        <p className="text-red-400 font-bold">Rejected ✕</p>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ship Modal */}
      <AnimatePresence>
        {showShipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 rounded-2xl w-full max-w-md overflow-hidden border border-dark-600"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">Provide Tracking Details</h2>
                <p className="text-sm text-gray-400 mb-6">Enter the shipping tracking number to mark this order as shipped.</p>
                <form onSubmit={submitShip} className="space-y-4">
                  <div>
                    <label className="input-label">Tracking Number (Optional)</label>
                    <input 
                      type="text"
                      className="input-field" 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. TRK123456789"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      className="flex-1 btn-secondary py-2"
                      onClick={() => setShowShipModal(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 btn-primary py-2"
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Saving...' : 'Confirm Shipment'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
