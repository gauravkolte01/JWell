import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import { logout } from '../../store/slices/authSlice';
import { fetchCart } from '../../store/slices/cartSlice';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user.role === 'customer') {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const handleLogout = () => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Collections' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-dark-900/95 backdrop-blur-xl shadow-2xl shadow-black/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
              <span className="text-dark-900 font-display font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-display font-bold gradient-text">JWell</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                  location.pathname === path ? 'text-primary-500' : 'text-gray-300 hover:text-primary-400'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-300 hover:text-primary-500 transition-colors p-2"
            >
              <HiOutlineSearch className="w-5 h-5" />
            </button>

            {user ? (
              <>
                {/* Cart */}
                {user.role === 'customer' && (
                  <Link to="/cart" className="relative text-gray-300 hover:text-primary-500 transition-colors p-2">
                    <HiOutlineShoppingBag className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-dark-900 
                                       text-xs font-bold rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-300 hover:text-primary-500 transition-colors p-2">
                    <HiOutlineUser className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">{user.first_name}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-700 border border-dark-500 
                                  rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 
                                  group-hover:visible transition-all duration-300 py-2">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:text-primary-500 hover:bg-dark-600">
                      Profile
                    </Link>
                    {user.role === 'customer' && (
                      <>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-300 hover:text-primary-500 hover:bg-dark-600">
                          My Orders
                        </Link>
                        <Link to="/complaints" className="block px-4 py-2 text-sm text-gray-300 hover:text-primary-500 hover:bg-dark-600">
                          Complaints
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:text-primary-500 hover:bg-dark-600">
                        Admin Panel
                      </Link>
                    )}
                    {user.role === 'supplier' && (
                      <Link to="/supplier" className="block px-4 py-2 text-sm text-gray-300 hover:text-primary-500 hover:bg-dark-600">
                        Supplier Panel
                      </Link>
                    )}
                    <hr className="border-dark-500 my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm px-5 py-2"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-primary-500 p-2"
            >
              {isOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSearch}
              className="pb-4 overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for jewellery..."
                className="input-field"
                autoFocus
              />
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-800 border-t border-dark-600"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className="block py-2 text-gray-300 hover:text-primary-500"
                >
                  {label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link to="/login" className="block py-2 text-gray-300 hover:text-primary-500">Sign In</Link>
                  <Link to="/register" className="block py-2 text-gray-300 hover:text-primary-500">Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
