import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <span className="text-dark-900 font-display font-bold text-lg">J</span>
              </div>
              <span className="text-2xl font-display font-bold gradient-text">JWell</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Crafting timeless elegance since 1990. Premium jewellery for every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Collections' },
                { to: '/products?category=rings', label: 'Rings' },
                { to: '/products?category=necklaces', label: 'Necklaces' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-primary-500 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {['Orders', 'Profile', 'Complaints'].map((label) => (
                <li key={label}>
                  <Link
                    to={`/${label.toLowerCase()}`}
                    className="text-gray-400 hover:text-primary-500 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <HiOutlinePhone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <HiOutlineMail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>support@jwell.com</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400 text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-600 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} JWell Jewellery Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
