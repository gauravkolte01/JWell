import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiX } from 'react-icons/hi';
import { supplierAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, []);
  const fetch = () => supplierAPI.getAll().then(res => setSuppliers(res.data.results || res.data)).finally(() => setLoading(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (edit) await supplierAPI.update(edit.id, form);
      else await supplierAPI.create(form);
      toast.success(edit ? 'Updated!' : 'Created!');
      setShowModal(false); fetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Suppliers</h1>
        <button onClick={() => { setEdit(null); setForm({ name: '', contact: '', email: '', address: '' }); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><HiPlus /> Add Supplier</button>
      </div>

      {loading ? <div className="skeleton h-64 rounded-xl" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="card p-5">
              <div className="flex justify-between">
                <h3 className="text-white font-semibold">{s.name}</h3>
                <button onClick={() => { setEdit(s); setForm({ name: s.name, contact: s.contact, email: s.email || '', address: s.address }); setShowModal(true); }} className="text-gray-400 hover:text-primary-500"><HiPencil /></button>
              </div>
              <p className="text-gray-400 text-sm mt-1">📞 {s.contact}</p>
              {s.email && <p className="text-gray-400 text-sm">✉️ {s.email}</p>}
              <p className="text-gray-400 text-sm">📍 {s.address}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h2 className="text-lg font-semibold text-white">{edit ? 'Edit' : 'New'} Supplier</h2><button onClick={() => setShowModal(false)}><HiX className="text-gray-400" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="input-label">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="input-label">Contact *</label><input className="input-field" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} required /></div>
              <div><label className="input-label">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="input-label">Address *</label><textarea className="input-field" rows="2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></div>
              <button type="submit" className="btn-primary w-full">{edit ? 'Update' : 'Create'}</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
