import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiTrash, HiMinus, HiPlus, HiArrowRight } from 'react-icons/hi';
import { fetchCart, updateCartItem, removeCartItem, clearCart } from '../../store/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const { items, totalPrice, loading } = useSelector((state) => state.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <div className="page-container px-4 max-w-7xl mx-auto"><div className="skeleton h-96 rounded-2xl mt-8" /></div>;

  return (
    <div className="page-container px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="section-title mb-8 mt-4">Shopping <span className="gradient-text">Cart</span></h1>

        {items.length === 0 ? (
          <div className="text-center py-20 card p-12">
            <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">Browse Products <HiArrowRight /></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div key={item.id} layout className="card p-4 flex gap-4">
                  <img
                    src={item.product?.image || 'https://images.unsplash.com/photo-1515562141589-67f0d569b507?w=200&q=80'}
                    alt={item.product?.name} className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?.id}`} className="text-white font-medium hover:text-primary-500 line-clamp-1">{item.product?.name}</Link>
                    <p className="text-sm text-gray-500">{item.product?.category_name}</p>
                    <p className="text-primary-500 font-bold mt-1">{fmt(item.product?.discounted_price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => dispatch(removeCartItem(item.id))} className="text-gray-500 hover:text-red-400"><HiTrash className="w-4 h-4" /></button>
                    <div className="flex items-center bg-dark-700 rounded-lg border border-dark-500">
                      <button onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) }))} className="p-2"><HiMinus className="w-3 h-3 text-gray-400" /></button>
                      <span className="px-3 text-white text-sm">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))} className="p-2"><HiPlus className="w-3 h-3 text-gray-400" /></button>
                    </div>
                    <p className="text-white font-medium text-sm">{fmt(item.subtotal)}</p>
                  </div>
                </motion.div>
              ))}
              <button onClick={() => dispatch(clearCart())} className="text-sm text-red-400 hover:text-red-300">Clear Cart</button>
            </div>

            <div className="card p-6 h-fit sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{fmt(totalPrice)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-green-400">Free</span></div>
                <hr className="border-dark-500" />
                <div className="flex justify-between text-white font-bold text-lg"><span>Total</span><span className="gradient-text">{fmt(totalPrice)}</span></div>
              </div>
              <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
                Proceed to Checkout <HiArrowRight />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
