import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', stock_quantity: '', discount: '0', material: '', weight: '', is_featured: false, is_active: true });

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = () => { productAPI.adminList().then(res => setProducts(res.data.results || res.data)).finally(() => setLoading(false)); };
  const fetchCategories = () => { productAPI.getCategories().then(res => setCategories(res.data)); };

  const openNew = () => { setEditProduct(null); setForm({ name: '', description: '', category: '', price: '', stock_quantity: '', discount: '0', material: '', weight: '', is_featured: false, is_active: true }); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, description: p.description, category: p.category, price: p.price, stock_quantity: p.stock_quantity, discount: p.discount, material: p.material || '', weight: p.weight || '', is_featured: p.is_featured, is_active: p.is_active }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) formData.append(k, v); });
    try {
      if (editProduct) { await productAPI.adminUpdate(editProduct.id, formData); toast.success('Product updated!'); }
      else { await productAPI.adminCreate(formData); toast.success('Product created!'); }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error('Failed to save product'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await productAPI.adminDelete(id); toast.success('Deleted!'); fetchProducts(); } catch { toast.error('Failed to delete'); }
  };

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Products</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-2"><HiPlus /> Add Product</button>
      </div>

      {loading ? <div className="skeleton h-96 rounded-xl" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>{['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-dark-700/50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-dark-600 overflow-hidden flex-shrink-0">{p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}</div><span className="text-white text-sm font-medium line-clamp-1">{p.name}</span></div></td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{categories.find(c => c.id === p.category)?.name}</td>
                    <td className="px-4 py-3 text-white text-sm">{fmt(p.price)}{p.discount > 0 && <span className="text-red-400 text-xs ml-1">-{p.discount}%</span>}</td>
                    <td className="px-4 py-3"><span className={`text-sm font-medium ${p.stock_quantity <= 5 ? 'text-red-400' : 'text-green-400'}`}>{p.stock_quantity}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-500"><HiPencil /></button><button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-400"><HiTrash /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-white">{editProduct ? 'Edit' : 'New'} Product</h2><button onClick={() => setShowModal(false)} className="text-gray-400"><HiX /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="input-label">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="input-label">Description *</label><textarea className="input-field" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Category *</label><select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="input-label">Price *</label><input type="number" step="0.01" className="input-field" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="input-label">Stock *</label><input type="number" className="input-field" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} required /></div>
                <div><label className="input-label">Discount %</label><input type="number" className="input-field" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} /></div>
                <div><label className="input-label">Material</label><input className="input-field" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Weight</label><input className="input-field" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
                <div><label className="input-label">Image</label><input type="file" accept="image/*" className="input-field" onChange={e => setForm({ ...form, image: e.target.files[0] })} /></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-gray-300"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="accent-primary-500" /> Featured</label>
                <label className="flex items-center gap-2 text-gray-300"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-primary-500" /> Active</label>
              </div>
              <button type="submit" className="btn-primary w-full">{editProduct ? 'Update' : 'Create'} Product</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
