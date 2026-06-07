import { useEffect, useState } from 'react';
import api from '../api/client';
import AdminUsers from './AdminUsers';
import AdminStores from './AdminStores';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('users');

  const loadStats = async () => {
    const { data } = await api.get('/admin/dashboard');
    setStats(data);
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <h1>Admin dashboard</h1>
          <p>Manage users, stores and monitor platform activity.</p>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="label">Total users</div>
            <div className="value">{stats ? stats.userCount : '—'}</div>
          </div>
          <div className="stat">
            <div className="label">Total stores</div>
            <div className="value">{stats ? stats.storeCount : '—'}</div>
          </div>
          <div className="stat">
            <div className="label">Total ratings</div>
            <div className="value">{stats ? stats.ratingCount : '—'}</div>
          </div>
        </div>

        <div className="tabbar">
          <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
          <button className={tab === 'stores' ? 'active' : ''} onClick={() => setTab('stores')}>Stores</button>
        </div>

        {tab === 'users' ? <AdminUsers onChange={loadStats} /> : <AdminStores onChange={loadStats} />}
      </div>
    </div>
  );
}
