import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import SortableTh from '../components/SortableTh';
import StarRating from '../components/StarRating';
import { validateName, validateEmail, validateAddress } from '../utils/validators';

const emptyForm = { name: '', email: '', address: '', ownerId: '' };

export default function AdminStores({ onChange }) {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/stores', {
        params: { ...filters, sortBy: sort.by, order: sort.order },
      });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    api.get('/admin/owners').then(({ data }) => setOwners(data)).catch(() => {});
  }, []);

  const onSort = (field) =>
    setSort((s) => ({ by: field, order: s.by === field && s.order === 'asc' ? 'desc' : 'asc' }));

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      setForm(emptyForm);
      setShowForm(false);
      load();
      onChange && onChange();
    } catch (err) {
      setFormError(err.response?.data?.message || (err.response?.data?.errors || []).join(', ') || 'Failed to create store');
    }
  };

  return (
    <div className="card">
      <div className="card-head">
        <h2>Stores</h2>
        <button className="btn btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add store'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <div className="filters">
            <div className="field">
              <label>Store name</label>
              <input value={form.name} onChange={set('name')} />
              {errors.name ? <div className="err">{errors.name}</div> : <div className="hint">20–60 characters</div>}
            </div>
            <div className="field">
              <label>Email</label>
              <input value={form.email} onChange={set('email')} />
              {errors.email && <div className="err">{errors.email}</div>}
            </div>
          </div>
          <div className="filters">
            <div className="field">
              <label>Address</label>
              <textarea rows="2" value={form.address} onChange={set('address')} />
              {errors.address && <div className="err">{errors.address}</div>}
            </div>
            <div className="field" style={{ maxWidth: 240 }}>
              <label>Owner (optional)</label>
              <select value={form.ownerId} onChange={set('ownerId')}>
                <option value="">— None —</option>
                {owners.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
              </select>
            </div>
          </div>
          <button className="btn">Create store</button>
        </form>
      )}

      <div className="filters">
        <div className="field"><label>Name</label><input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} /></div>
        <div className="field"><label>Email</label><input value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} /></div>
        <div className="field"><label>Address</label><input value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} /></div>
      </div>

      {loading ? <div className="spinner">Loading…</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="Name" field="name" sort={sort} onSort={onSort} />
                <SortableTh label="Email" field="email" sort={sort} onSort={onSort} />
                <SortableTh label="Address" field="address" sort={sort} onSort={onSort} />
                <SortableTh label="Rating" field="rating" sort={sort} onSort={onSort} />
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {s.rating != null ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <StarRating value={Math.round(s.rating)} readonly />
                        <span className="rating-num">{s.rating}</span>
                      </span>
                    ) : <span style={{ color: 'var(--ink-soft)' }}>No ratings</span>}
                  </td>
                </tr>
              ))}
              {stores.length === 0 && <tr><td colSpan="4" className="empty">No stores found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
