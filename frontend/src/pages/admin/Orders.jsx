import { useState, useEffect } from 'react';
import { orderAPI, supplierAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiChevronUp, HiOutlineTruck, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
  returned: 'badge-danger'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [processingState, setProcessingState] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, [filter]);

  const fetchOrders = () => {
    setLoading(true);
    const params = filter ? { order_status: filter } : {};
    orderAPI.adminList(params)
      .then(res => setOrders(res.data.results || res.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  const fetchSuppliers = () => {
    supplierAPI.getAll()
      .then(res => setSuppliers(res.data.results || res.data))
      .catch(() => {});
  };

  const handleStartProcessing = (orderId) => {
    setSelectedOrderId(orderId);
    setShowAssignModal(true);
  };

  const submitAssignSupplier = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) return toast.error("Select a supplier");
    
    setProcessingState(true);
    try {
      await orderAPI.adminProcessing(selectedOrderId, {
        supplier_id: selectedSupplierId,
        notes
      });
      toast.success('Order assigned to supplier and is now processing!');
      setShowAssignModal(false);
      fetchOrders();
      setExpandedId(selectedOrderId);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process order');
    } finally {
      setProcessingState(false);
    }
  };

  const handleMarkDelivered = async (id) => {
    if (!window.confirm("Confirm this order has been delivered?")) return;
    try {
      await orderAPI.adminDelivered(id);
      toast.success('Order marked as delivered!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark delivered');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Order Management</h1>
        <select className="input-field w-40" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="skeleton h-96 rounded-xl" />
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card overflow-hidden">
              {/* Header Row (Always visible) */}
              <div 
                className="p-4 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-dark-600/50 transition-colors"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="text-left">
                    <span className="text-sm text-gray-500 block">Order ID</span>
                    <span className="text-white font-bold">#{order.id}</span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-sm text-gray-500 block">Date</span>
                    <span className="text-gray-300">{new Date(order.order_date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-gray-500 block">Customer</span>
                    <span className="text-white">{order.customer_name}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-gray-500 block">Total</span>
                    <span className="text-primary-400 font-bold">{fmt(order.total_amount)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                  <span className={statusColors[order.order_status]}>{order.order_status}</span>
                  {expandedId === order.id ? <HiChevronUp className="w-6 h-6 text-gray-400" /> : <HiChevronDown className="w-6 h-6 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-dark-600 bg-dark-800/50 p-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Customer & Items */}
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <h3 className="text-white font-semibold mb-3">Shipping Details</h3>
                          <p className="text-sm text-gray-300">{order.customer_name} ({order.customer_email})</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {order.shipping_address}<br/>
                            {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                          </p>
                          {order.notes && (
                            <p className="text-sm text-yellow-400/80 bg-yellow-400/10 p-2 rounded mt-2">
                              Note: {order.notes}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-white font-semibold mb-3">Order Items</h3>
                          <div className="space-y-2">
                            {order.items?.map(item => (
                              <div key={item.id} className="flex justify-between items-center bg-dark-700 p-2 rounded">
                                <div className="flex items-center gap-3">
                                  {item.product_image && <img src={item.product_image} alt="" className="w-10 h-10 rounded object-cover" />}
                                  <span className="text-sm text-white">{item.product_name}</span>
                                </div>
                                <span className="text-sm text-gray-400">{item.quantity} x {fmt(item.product_price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Fulfillment & Actions */}
                      <div className="space-y-6">
                        {/* Fulfillment Status */}
                        <div className="bg-dark-700 p-4 rounded-xl border border-dark-600">
                          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <HiOutlineTruck /> Fulfillment Status
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Payment:</span>
                              <span className={`capitalize ${order.payment_status === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {order.payment_status}
                              </span>
                            </div>
                            
                            {order.supplier_request ? (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Supplier:</span>
                                  <span className="text-white">{order.supplier_request.supplier_name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Supplier Status:</span>
                                  <span className="capitalize text-primary-400 font-medium">
                                    {order.supplier_request.status}
                                  </span>
                                </div>
                                {order.tracking_number && (
                                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-dark-600">
                                    <span className="text-gray-400">Tracking:</span>
                                    <span className="text-white">{order.tracking_number}</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-gray-500 italic">No supplier assigned yet.</div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div>
                          <h3 className="text-white font-semibold mb-3">Available Actions</h3>
                          <div className="space-y-3">
                            {order.order_status === 'pending' && (
                              <div className="text-sm text-yellow-500 flex items-center gap-2">
                                <HiOutlineClock /> Awaiting customer payment...
                              </div>
                            )}
                            
                            {order.order_status === 'confirmed' && (
                              <button 
                                onClick={() => handleStartProcessing(order.id)}
                                className="w-full btn-primary py-2"
                              >
                                Assign Supplier & Process
                              </button>
                            )}

                            {order.order_status === 'processing' && (
                              <div className="text-sm text-primary-400 flex items-center gap-2">
                                <HiOutlineTruck /> Waiting for supplier to ship...
                              </div>
                            )}

                            {order.order_status === 'shipped' && (
                              <button 
                                onClick={() => handleMarkDelivered(order.id)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors"
                              >
                                Mark as Delivered
                              </button>
                            )}

                            {order.order_status === 'delivered' && (
                              <div className="text-sm text-green-500 flex items-center gap-2">
                                <HiOutlineCheckCircle /> Order completed successfully.
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Assign Supplier Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 rounded-2xl w-full max-w-md overflow-hidden border border-dark-600"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Assign Supplier</h2>
              <form onSubmit={submitAssignSupplier} className="space-y-4">
                <div>
                  <label className="input-label">Select Supplier</label>
                  <select 
                    className="input-field" 
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                  >
                    <option value="">-- Choose a supplier --</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name} ({sup.contact})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Notes for Supplier (Optional)</label>
                  <textarea 
                    className="input-field" 
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Please expedite shipping..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    className="flex-1 btn-secondary py-2"
                    onClick={() => setShowAssignModal(false)}
                    disabled={processingState}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 btn-primary py-2"
                    disabled={processingState}
                  >
                    {processingState ? 'Assigning...' : 'Assign & Process'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
