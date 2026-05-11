import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  useEffect(() => {
    productAPI.getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, ordering };
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    productAPI.getAll(params)
      .then(res => {
        setProducts(res.data.results || res.data);
        setTotalPages(Math.ceil((res.data.count || res.data.length) / 12));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, category, ordering, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="page-container px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="section-title">Our <span className="gradient-text">Collections</span></h1>
          <p className="section-subtitle">Discover handcrafted jewellery for every occasion</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card p-6 space-y-6 sticky top-24">
              {/* Search */}
              <div>
                <label className="input-label">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => updateParam('search', e.target.value)}
                  />
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="input-label">Category</label>
                <select
                  className="input-field"
                  value={category}
                  onChange={(e) => updateParam('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="input-label">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="input-field text-sm"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParam('min_price', e.target.value)}
                  />
                  <input
                    type="number"
                    className="input-field text-sm"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParam('max_price', e.target.value)}
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="input-label">Sort By</label>
                <select
                  className="input-field"
                  value={ordering}
                  onChange={(e) => updateParam('ordering', e.target.value)}
                >
                  <option value="-created_at">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                  <option value="-view_count">Most Popular</option>
                </select>
              </div>

              {/* Clear */}
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 text-primary-500 mb-4"
            >
              <HiOutlineAdjustments className="w-5 h-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-4">
                    <div className="skeleton h-64 w-full rounded-lg mb-4" />
                    <div className="skeleton h-4 w-3/4 mb-2" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No products found</p>
                <button onClick={() => setSearchParams({})} className="text-primary-500 mt-2">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => updateParam('page', p.toString())}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          p === page
                            ? 'bg-primary-500 text-dark-900'
                            : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
