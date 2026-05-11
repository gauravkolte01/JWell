import { useState, useEffect } from 'react';
import { complaintAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-danger' };

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, []);
  const fetch = () => complaintAPI.adminList().then(res => setComplaints(res.data.results || res.data)).finally(() => setLoading(false));

  const updateComplaint = async (id, data) => {
    try { await complaintAPI.adminUpdate(id, data); toast.success('Updated!'); fetch(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Complaints</h1>
      {loading ? <div className="skeleton h-96 rounded-xl" /> : complaints.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No complaints</div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
            <div key={c.id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-medium">#{c.id} — {c.customer_name}</p>
                  <p className="text-xs text-gray-500">Order #{c.order} | {c.complaint_type} | {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <select className="bg-dark-800 border border-dark-500 rounded px-2 py-1 text-sm text-white" value={c.status} onChange={e => updateComplaint(c.id, { status: e.target.value })}>
                  <option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                </select>
              </div>
              <p className="text-gray-400 text-sm mb-3">{c.message}</p>
              <div className="flex gap-2">
                <input type="text" placeholder="Admin response..." className="input-field text-sm flex-1" id={`resp-${c.id}`} defaultValue={c.admin_response || ''} />
                <button onClick={() => updateComplaint(c.id, { admin_response: document.getElementById(`resp-${c.id}`).value })} className="btn-primary text-sm px-4">Send</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
