import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiSparkles, HiShieldCheck, HiTruck } from 'react-icons/hi';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, catRes] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getCategories(),
        ]);
        setFeatured(featuredRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: HiSparkles, title: 'Premium Quality', desc: 'BIS hallmarked gold and certified diamonds' },
    { icon: HiShieldCheck, title: 'Secure Payment', desc: 'Stripe-powered encrypted transactions' },
    { icon: HiTruck, title: 'Free Delivery', desc: 'Insured shipping on all orders' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/60 to-dark-900 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141589-67f0d569b507?w=1920&q=80')] bg-cover bg-center" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/30 
                           rounded-full text-primary-400 text-sm font-medium mb-6 tracking-wider">
              ✦ EXQUISITE JEWELLERY COLLECTION
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Timeless <span className="gradient-text">Elegance</span><br />
              Crafted for You
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover our exquisite collection of handcrafted jewellery pieces, 
              from stunning diamonds to pure gold masterpieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Explore Collections <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products?is_featured=true" className="btn-secondary text-lg px-8 py-4">
                View Featured
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary-500/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-4 p-6"
              >
                <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-dark-900" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Shop by <span className="gradient-text">Category</span></h2>
            <p className="section-subtitle">Find the perfect piece for every occasion</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/products?category=${cat.id}`}
                  className="card-hover p-6 text-center group block"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/10 
                                flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <HiSparkles className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-white font-medium">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cat.product_count} items</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="section-title">Featured <span className="gradient-text">Collection</span></h2>
              <p className="section-subtitle">Our most coveted pieces</p>
            </div>
            <Link to="/products" className="text-primary-500 hover:text-primary-400 flex items-center gap-1 font-medium">
              View All <HiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-64 w-full rounded-lg mb-4" />
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Every Piece Tells a <span className="gradient-text">Story</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              From engagement rings to heirloom necklaces, find jewellery that captures 
              your most precious moments.
            </p>
            <Link to="/products" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
              Start Shopping <HiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
