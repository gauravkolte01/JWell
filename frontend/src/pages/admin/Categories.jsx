import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { fetch(); }, []);
  const fetch = () => productAPI.adminCategories().then(res => setCategories(res.data.results || res.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (edit) await productAPI.adminUpdateCategory(edit.id, form);
      else await productAPI.adminCreateCategory(form);
      toast.success(edit ? 'Updated!' : 'Created!');
      setShowModal(false); fetch();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await productAPI.adminDeleteCategory(id); toast.success('Deleted!'); fetch(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Categories</h1>
        <button onClick={() => { setEdit(null); setForm({ name: '', description: '' }); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><HiPlus /> Add Category</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="card p-5">
            <div className="flex justify-between"><h3 className="text-white font-semibold">{c.name}</h3><div className="flex gap-1"><button onClick={() => { setEdit(c); setForm({ name: c.name, description: c.description || '' }); setShowModal(true); }} className="text-gray-400 hover:text-primary-500"><HiPencil /></button><button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-400"><HiTrash /></button></div></div>
            <p className="text-gray-400 text-sm mt-1">{c.description}</p>
            <p className="text-primary-500 text-sm mt-2">{c.product_count} products</p>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h2 className="text-lg font-semibold text-white">{edit ? 'Edit' : 'New'} Category</h2><button onClick={() => setShowModal(false)}><HiX className="text-gray-400" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="input-label">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="input-label">Description</label><textarea className="input-field" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <button type="submit" className="btn-primary w-full">{edit ? 'Update' : 'Create'}</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
