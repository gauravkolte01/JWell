import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';

export default function Reports() {
  const [tab, setTab] = useState('sales');
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (tab === 'sales') reportAPI.sales({ days }).then(r => setSalesData(r.data));
    if (tab === 'products') reportAPI.products().then(r => setProductData(r.data));
    if (tab === 'customers') reportAPI.customers().then(r => setCustomerData(r.data));
  }, [tab, days]);

  const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
  const tabs = ['sales', 'products', 'customers'];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Reports</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-primary-500 text-dark-900' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>{t}</button>
        ))}
      </div>

      {tab === 'sales' && salesData && (
        <div>
          <div className="flex gap-2 mb-4">
            {[7, 30, 90].map(d => <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 rounded text-sm ${days === d ? 'bg-primary-500/20 text-primary-500' : 'text-gray-400'}`}>{d} days</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-5"><p className="text-gray-400 text-sm">Total Revenue</p><p className="text-2xl font-bold gradient-text">{fmt(salesData.total_revenue)}</p></div>
            <div className="card p-5"><p className="text-gray-400 text-sm">Total Orders</p><p className="text-2xl font-bold text-white">{salesData.total_orders}</p></div>
            <div className="card p-5"><p className="text-gray-400 text-sm">Avg Order Value</p><p className="text-2xl font-bold text-white">{fmt(salesData.avg_order_value)}</p></div>
          </div>
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">Top Selling Products</h3>
            <div className="space-y-2">
              {salesData.top_products?.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                  <span className="text-white text-sm">{p.product_name}</span>
                  <div className="flex gap-4"><span className="text-gray-400 text-sm">{p.total_sold} sold</span><span className="text-primary-500 text-sm font-medium">{fmt(p.total_revenue)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && productData && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-5"><p className="text-gray-400 text-sm">Total Products</p><p className="text-2xl font-bold text-white">{productData.total_products}</p></div>
            <div className="card p-5"><p className="text-gray-400 text-sm">Out of Stock</p><p className="text-2xl font-bold text-red-400">{productData.out_of_stock}</p></div>
            <div className="card p-5"><p className="text-gray-400 text-sm">Low Stock</p><p className="text-2xl font-bold text-yellow-400">{productData.low_stock_count}</p></div>
          </div>
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">Categories Breakdown</h3>
            <div className="space-y-2">
              {productData.categories?.map((c, i) => (
                <div key={i} className="flex justify-between p-3 bg-dark-800 rounded-lg"><span className="text-white text-sm">{c.name}</span><span className="text-gray-400 text-sm">{c.product_count} products, {c.total_stock || 0} total stock</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'customers' && customerData && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-5"><p className="text-gray-400 text-sm">Total Customers</p><p className="text-2xl font-bold text-white">{customerData.total_customers}</p></div>
            <div className="card p-5"><p className="text-gray-400 text-sm">Active</p><p className="text-2xl font-bold text-green-400">{customerData.active_customers}</p></div>
            <div className="card p-5"><p className="text-gray-400 text-sm">New This Month</p><p className="text-2xl font-bold text-primary-500">{customerData.new_this_month}</p></div>
          </div>
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">Top Customers</h3>
            <div className="space-y-2">
              {customerData.top_customers?.map((c, i) => (
                <div key={i} className="flex justify-between p-3 bg-dark-800 rounded-lg">
                  <span className="text-white text-sm">{c.user__first_name} {c.user__last_name} <span className="text-gray-500 text-xs">({c.user__email})</span></span>
                  <div className="flex gap-4"><span className="text-gray-400 text-sm">{c.total_orders} orders</span><span className="text-primary-500 font-medium text-sm">{fmt(c.total_spent)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
