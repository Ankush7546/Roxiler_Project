import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import StarRating from '../components/StarRating';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stores', {
        params: { name: search.name, address: search.address, sortBy: sort.by, order: sort.order },
      });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const rate = async (storeId, rating) => {
    setSavingId(storeId);
    try {
      await api.post(`/stores/${storeId}/rating`, { rating });
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, userRating: rating } : s))
      );
      // refresh to update overall averages
      load();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <h1>Browse stores</h1>
          <p>Find a store, then leave or update your rating.</p>
        </div>

        <div className="card">
          <div className="filters">
            <div className="field">
              <label>Search by name</label>
              <input value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} placeholder="Store name…" />
            </div>
            <div className="field">
              <label>Search by address</label>
              <input value={search.address} onChange={(e) => setSearch({ ...search, address: e.target.value })} placeholder="Address…" />
            </div>
            <div className="field" style={{ maxWidth: 180 }}>
              <label>Sort by</label>
              <select value={`${sort.by}:${sort.order}`} onChange={(e) => {
                const [by, order] = e.target.value.split(':');
                setSort({ by, order });
              }}>
                <option value="name:asc">Name (A–Z)</option>
                <option value="name:desc">Name (Z–A)</option>
                <option value="rating:desc">Rating (high–low)</option>
                <option value="rating:asc">Rating (low–high)</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="spinner">Loading stores…</div>
        ) : stores.length === 0 ? (
          <div className="empty">No stores found.</div>
        ) : (
          <div className="store-grid">
            {stores.map((s) => (
              <div className="store-card" key={s.id}>
                <h3>{s.name}</h3>
                <div className="addr">{s.address}</div>
                <div className="store-meta">
                  <div className="block">
                    <div className="k">Overall</div>
                    <div className="v">
                      {s.overallRating != null ? (
                        <>★ {s.overallRating}</>
                      ) : <span style={{ fontSize: '.9rem', fontFamily: 'Spline Sans', color: 'var(--ink-soft)' }}>No ratings</span>}
                    </div>
                  </div>
                  <div className="block" style={{ textAlign: 'right' }}>
                    <div className="k">Ratings</div>
                    <div className="v">{s.ratingCount}</div>
                  </div>
                </div>
                <div className="your-rating-row">
                  <span className="lbl">
                    {s.userRating ? 'Your rating' : 'Rate this store'}
                  </span>
                  <StarRating
                    value={s.userRating || 0}
                    onChange={(r) => rate(s.id, r)}
                  />
                </div>
                {savingId === s.id && <div className="hint">Saving…</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
