import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiMinus, HiPlus } from 'react-icons/hi';
import { productAPI, recommendationAPI } from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';
import ProductCard from '../../components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productAPI.getById(id),
      recommendationAPI.getRelated(id).catch(() => ({ data: [] })),
    ]).then(([prodRes, relRes]) => {
      setProduct(prodRes.data);
      setRelated(relRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!user) return toast.error('Please login first');
    dispatch(addToCart({ productId: product.id, quantity }))
      .unwrap()
      .then(() => toast.success('Added to cart!'));
  };

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <div className="page-container px-4 max-w-7xl mx-auto"><div className="skeleton h-[500px] rounded-2xl mt-8" /></div>;
  if (!product) return <div className="page-container text-center text-gray-400">Product not found</div>;

  const img = product.image || 'https://images.unsplash.com/photo-1515562141589-67f0d569b507?w=800&q=80';

  return (
    <div className="page-container px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative rounded-2xl overflow-hidden bg-dark-800">
              <img src={img} alt={product.name} className="w-full h-[500px] object-cover" />
              {product.discount > 0 && <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white font-bold rounded-lg">-{product.discount}%</span>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <p className="text-primary-500 font-medium uppercase tracking-wider text-sm">{product.category_name}</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mt-2">{product.name}</h1>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold gradient-text">{fmt(product.discounted_price)}</span>
              {product.discount > 0 && <span className="text-xl text-gray-500 line-through">{fmt(product.price)}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {product.material && <div className="card p-4"><p className="text-gray-500 text-xs uppercase">Material</p><p className="text-white font-medium">{product.material}</p></div>}
              {product.weight && <div className="card p-4"><p className="text-gray-500 text-xs uppercase">Weight</p><p className="text-white font-medium">{product.weight}</p></div>}
              <div className="card p-4"><p className="text-gray-500 text-xs uppercase">Stock</p><p className={product.is_in_stock ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>{product.is_in_stock ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}</p></div>
            </div>
            <div><h3 className="text-white font-semibold mb-2">Description</h3><p className="text-gray-400 leading-relaxed">{product.description}</p></div>
            {product.is_in_stock && (
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-dark-700 rounded-lg border border-dark-500">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-400 hover:text-white"><HiMinus className="w-4 h-4" /></button>
                  <span className="px-4 text-white font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="p-3 text-gray-400 hover:text-white"><HiPlus className="w-4 h-4" /></button>
                </div>
                <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2"><HiOutlineShoppingBag className="w-5 h-5" /> Add to Cart</button>
              </div>
            )}
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title mb-8">Related <span className="gradient-text">Products</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
