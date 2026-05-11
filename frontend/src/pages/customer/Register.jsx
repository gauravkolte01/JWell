import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { register } from '../../store/slices/authSlice';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: '',
    first_name: '', last_name: '', phone: '', address: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) navigate('/');
  };

  return (
    <div className="page-container flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold gradient-text">Create Account</h1>
            <p className="text-gray-400 mt-2">Join our exclusive jewellery community</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name</label>
                <input name="first_name" className="input-field" placeholder="First name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input name="last_name" className="input-field" placeholder="Last name" value={formData.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="input-label">Username</label>
              <input name="username" className="input-field" placeholder="Choose a username" value={formData.username} onChange={handleChange} required />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input name="email" type="email" className="input-field" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input name="phone" className="input-field" placeholder="+91-XXXXXXXXXX" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="input-label">Address</label>
              <textarea name="address" className="input-field" rows="2" placeholder="Your address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Password</label>
                <input name="password" type="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div>
                <label className="input-label">Confirm Password</label>
                <input name="password2" type="password" className="input-field" placeholder="••••••••" value={formData.password2} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center">
              {loading ? <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
