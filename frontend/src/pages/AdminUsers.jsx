import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import SortableTh from '../components/SortableTh';
import StarRating from '../components/StarRating';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validators';

const emptyForm = { name: '', email: '', password: '', address: '', role: 'USER' };

export default function AdminUsers({ onChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { ...filters, sortBy: sort.by, order: sort.order },
      });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const onSort = (field) =>
    setSort((s) => ({ by: field, order: s.by === field && s.order === 'asc' ? 'desc' : 'asc' }));

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      address: validateAddress(form.address),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    try {
      await api.post('/admin/users', form);
      setForm(emptyForm);
      setShowForm(false);
      load();
      onChange && onChange();
    } catch (err) {
      setFormError(err.response?.data?.message || (err.response?.data?.errors || []).join(', ') || 'Failed to create user');
    }
  };

  const openDetail = async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    setDetail(data);
  };

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h2>Users</h2>
          <button className="btn btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ Add user'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="filters">
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={set('name')} />
                {errors.name && <div className="err">{errors.name}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input value={form.email} onChange={set('email')} />
                {errors.email && <div className="err">{errors.email}</div>}
              </div>
            </div>
            <div className="filters">
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={set('password')} />
                {errors.password && <div className="err">{errors.password}</div>}
              </div>
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={set('role')}>
                  <option value="USER">Normal User</option>
                  <option value="OWNER">Store Owner</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Address</label>
              <textarea rows="2" value={form.address} onChange={set('address')} />
              {errors.address && <div className="err">{errors.address}</div>}
            </div>
            <button className="btn">Create user</button>
          </form>
        )}

        <div className="filters">
          <div className="field"><label>Name</label><input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} /></div>
          <div className="field"><label>Address</label><input value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} /></div>
          <div className="field" style={{ maxWidth: 160 }}>
            <label>Role</label>
            <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <option value="">All roles</option>
              <option value="USER">Normal User</option>
              <option value="OWNER">Store Owner</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
        </div>

        {loading ? <div className="spinner">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <SortableTh label="Name" field="name" sort={sort} onSort={onSort} />
                  <SortableTh label="Email" field="email" sort={sort} onSort={onSort} />
                  <SortableTh label="Address" field="address" sort={sort} onSort={onSort} />
                  <SortableTh label="Role" field="role" sort={sort} onSort={onSort} />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.address}</td>
                    <td><span className={`role-tag role-${u.role}`}>{u.role}</span></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => openDetail(u.id)}>View</button></td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="empty">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="card" style={{ borderColor: 'var(--rust)' }}>
          <div className="card-head">
            <h2>User details</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>Close</button>
          </div>
          <p><strong>Name:</strong> {detail.name}</p>
          <p><strong>Email:</strong> {detail.email}</p>
          <p><strong>Address:</strong> {detail.address || '—'}</p>
          <p><strong>Role:</strong> <span className={`role-tag role-${detail.role}`}>{detail.role}</span></p>
          {detail.role === 'OWNER' && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>Store rating:</strong>{' '}
              {detail.rating != null ? <><StarRating value={Math.round(detail.rating)} readonly /> <span className="rating-num">{detail.rating}</span></> : 'No ratings yet'}
            </p>
          )}
        </div>
      )}
    </>
  );
}
