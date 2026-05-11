import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheckCircle } from 'react-icons/hi';
import { paymentAPI } from '../../services/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(false);
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (sessionId) {
      paymentAPI.verify(sessionId).then(() => setVerified(true)).catch(() => setVerified(true));
    }
  }, [sessionId]);

  return (
    <div className="page-container flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-12 text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <HiCheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-6">Your order has been placed successfully. We'll notify you when it ships.</p>
        <div className="flex flex-col gap-3">
          {orderId && <Link to={`/orders/${orderId}`} className="btn-primary">View Order</Link>}
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </motion.div>
    </div>
  );
}
