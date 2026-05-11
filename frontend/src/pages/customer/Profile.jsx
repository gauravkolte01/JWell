import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import { updateUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', address: user?.address || '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      dispatch(updateUser(data));
      toast.success('Profile updated!');
    } catch (err) { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(pwForm);
      toast.success('Password changed!');
      setPwForm({ old_password: '', new_password: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
  };

  return (
    <div className="page-container px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="section-title mb-8 mt-4">My <span className="gradient-text">Profile</span></h1>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">First Name</label><input className="input-field" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
                <div><label className="input-label">Last Name</label><input className="input-field" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              </div>
              <div><label className="input-label">Email</label><input className="input-field opacity-50" value={user?.email} disabled /></div>
              <div><label className="input-label">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="input-label">Address</label><textarea className="input-field" rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              <div><label className="input-label">Current Password</label><input type="password" className="input-field" value={pwForm.old_password} onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} required /></div>
              <div><label className="input-label">New Password</label><input type="password" className="input-field" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} required /></div>
              <button type="submit" className="btn-secondary">Change Password</button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
