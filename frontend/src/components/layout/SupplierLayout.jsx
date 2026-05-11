import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiOutlineChartBar, HiOutlineClipboardList,
  HiOutlineLogout, HiOutlineMenu, HiOutlineX
} from 'react-icons/hi';
import { logout } from '../../store/slices/authSlice';

const sidebarLinks = [
  { path: '/supplier', label: 'Dashboard', icon: HiOutlineChartBar, exact: true },
  { path: '/supplier/orders', label: 'Orders', icon: HiOutlineClipboardList },
];

export default function SupplierLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700 
                         transform transition-transform duration-300 lg:translate-x-0 ${
                           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                         }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <Link to="/supplier" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                <span className="text-dark-900 font-display font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-display font-bold gradient-text">Supplier</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {sidebarLinks.map(({ path, label, icon: Icon, exact }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path, exact)
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-dark-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">Supplier</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <HiOutlineLogout className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 bg-dark-800 border-b border-dark-700 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
            <HiOutlineMenu className="w-6 h-6" />
          </button>
          <span className="text-lg font-display font-bold gradient-text">JWell Supplier</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
