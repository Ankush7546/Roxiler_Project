import { useEffect, useState } from 'react';
import api from '../api/client';
import StarRating from '../components/StarRating';
import SortableTh from '../components/SortableTh';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ by: 'ratedAt', order: 'desc' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/owner/dashboard');
        setData(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSort = (field) =>
    setSort((s) => ({ by: field, order: s.by === field && s.order === 'asc' ? 'desc' : 'asc' }));

  if (loading) return <div className="spinner">Loading dashboard…</div>;

  const raters = [...(data?.raters || [])].sort((a, b) => {
    let av = a[sort.by], bv = b[sort.by];
    if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase(); }
    if (av < bv) return sort.order === 'asc' ? -1 : 1;
    if (av > bv) return sort.order === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <h1>Owner dashboard</h1>
          <p>See how customers are rating your store.</p>
        </div>

        {data.stores.length === 0 ? (
          <div className="empty">No store is linked to your account yet. Contact an administrator.</div>
        ) : (
          <>
            <div className="stats">
              <div className="stat">
                <div className="label">Average rating</div>
                <div className="value">{data.averageRating != null ? `★ ${data.averageRating}` : '—'}</div>
              </div>
              <div className="stat">
                <div className="label">Total ratings</div>
                <div className="value">{data.totalRatings || 0}</div>
              </div>
              <div className="stat">
                <div className="label">Your stores</div>
                <div className="value">{data.stores.length}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h2>Your stores</h2></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Address</th></tr></thead>
                  <tbody>
                    {data.stores.map((s) => (
                      <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.address}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h2>Customers who rated you</h2></div>
              {raters.length === 0 ? (
                <div className="empty">No ratings submitted yet.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <SortableTh label="Name" field="name" sort={sort} onSort={onSort} />
                        <SortableTh label="Email" field="email" sort={sort} onSort={onSort} />
                        <SortableTh label="Store" field="storeName" sort={sort} onSort={onSort} />
                        <SortableTh label="Rating" field="rating" sort={sort} onSort={onSort} />
                      </tr>
                    </thead>
                    <tbody>
                      {raters.map((r, i) => (
                        <tr key={`${r.id}-${r.storeId}-${i}`}>
                          <td>{r.name}</td>
                          <td>{r.email}</td>
                          <td>{r.storeName}</td>
                          <td><StarRating value={r.rating} readonly /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
