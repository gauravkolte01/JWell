import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, []);
  const fetch = () => authAPI.getUsers().then(res => setUsers(res.data.results || res.data)).finally(() => setLoading(false));

  const toggleActive = async (id, active) => {
    try { await authAPI.updateUser(id, { is_active: !active }); toast.success('Updated!'); fetch(); } catch { toast.error('Failed'); }
  };

  const roleColors = { customer: 'badge-info', admin: 'badge-warning', supplier: 'badge-success' };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Users</h1>
      {loading ? <div className="skeleton h-96 rounded-xl" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>{['User', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-dark-700/50">
                    <td className="px-4 py-3 text-white text-sm">{u.first_name} {u.last_name} <span className="text-gray-500">(@{u.username})</span></td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-4 py-3"><span className={roleColors[u.role]}>{u.role}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={u.is_active ? 'badge-success' : 'badge-danger'}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3"><button onClick={() => toggleActive(u.id, u.is_active)} className={`text-sm ${u.is_active ? 'text-red-400' : 'text-green-400'}`}>{u.is_active ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
