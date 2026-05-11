import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiStar } from 'react-icons/hi';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ productId: product.id, quantity: 1 }))
      .unwrap()
      .then(() => toast.success('Added to cart!'))
      .catch((err) => toast.error(err));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : product.image)
    : 'https://images.unsplash.com/photo-1515562141589-67f0d569b507?w=400&q=80';

  return (
    <Link to={`/products/${product.id}`}>
      <motion.div 
        className="card-hover group overflow-hidden"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515562141589-67f0d569b507?w=400&q=80'; }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                -{product.discount}%
              </span>
            )}
            {product.is_featured && (
              <span className="px-2 py-1 bg-primary-500 text-dark-900 text-xs font-bold rounded flex items-center gap-1">
                <HiStar className="w-3 h-3" /> Featured
              </span>
            )}
          </div>

          {/* Add to cart button */}
          {product.is_in_stock && user?.role === 'customer' && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 p-3 bg-primary-500 text-dark-900 rounded-full 
                       shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       hover:bg-primary-400"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-primary-500 font-medium uppercase tracking-wider mb-1">
            {product.category_name}
          </p>
          <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-white">
              {formatPrice(product.discounted_price)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {!product.is_in_stock && (
            <span className="text-xs text-red-400 mt-1 inline-block">Out of Stock</span>
          )}
          {product.material && (
            <p className="text-xs text-gray-500 mt-1">{product.material}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
