import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { complaintAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order: '', complaint_type: 'complaint', message: '' });
  const [loading, setLoading] = useState(true);

  const fetchComplaints = () => {
    complaintAPI.getAll().then(res => setComplaints(res.data.results || res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintAPI.create(form);
      toast.success('Complaint submitted!');
      setShowForm(false);
      setForm({ order: '', complaint_type: 'complaint', message: '' });
      fetchComplaints();
    } catch (err) { toast.error('Failed to submit complaint'); }
  };

  const statusColors = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-danger' };

  return (
    <div className="page-container px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-4">
          <h1 className="section-title">My <span className="gradient-text">Complaints</span></h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">{showForm ? 'Cancel' : 'New Complaint'}</button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Order ID *</label><input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} required /></div>
                <div><label className="input-label">Type</label>
                  <select className="input-field" value={form.complaint_type} onChange={(e) => setForm({ ...form, complaint_type: e.target.value })}>
                    <option value="complaint">Complaint</option><option value="return">Return</option><option value="refund">Refund</option><option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div><label className="input-label">Message *</label><textarea className="input-field" rows="3" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
              <button type="submit" className="btn-primary">Submit</button>
            </form>
          </motion.div>
        )}

        {loading ? <div className="skeleton h-48 rounded-xl" /> : complaints.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">No complaints yet</div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.id} className="card p-5">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="text-white font-medium">#{c.id} — Order #{c.order}</p><p className="text-sm text-gray-500 capitalize">{c.complaint_type}</p></div>
                  <span className={statusColors[c.status]}>{c.status?.replace('_', ' ')}</span>
                </div>
                <p className="text-gray-400 text-sm">{c.message}</p>
                {c.admin_response && <div className="mt-3 p-3 bg-dark-800 rounded-lg"><p className="text-xs text-primary-500 mb-1">Admin Response:</p><p className="text-gray-300 text-sm">{c.admin_response}</p></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
