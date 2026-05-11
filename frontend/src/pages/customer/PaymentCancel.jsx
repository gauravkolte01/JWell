import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiXCircle } from 'react-icons/hi';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="page-container flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-12 text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <HiXCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 mb-6">Your payment was cancelled. Your order is still pending.</p>
        <div className="flex flex-col gap-3">
          {orderId && <Link to={`/orders/${orderId}`} className="btn-primary">View Order</Link>}
          <Link to="/cart" className="btn-secondary">Back to Cart</Link>
        </div>
      </motion.div>
    </div>
  );
}
