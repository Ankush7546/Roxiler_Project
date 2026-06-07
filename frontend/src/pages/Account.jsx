import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/validators';

export default function Account() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg(null);
    const pwErr = validatePassword(form.newPassword);
    if (pwErr) return setErr(pwErr);
    if (form.newPassword !== form.confirm) return setErr('Passwords do not match');
    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e2) {
      setErr(e2.response?.data?.message || (e2.response?.data?.errors || []).join(', ') || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="page-head">
          <h1>Account</h1>
          <p>{user?.name} · {user?.email}</p>
        </div>
        <div className="card">
          <div className="card-head"><h2>Update password</h2></div>
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Current password</label>
              <input type="password" value={form.currentPassword} onChange={set('currentPassword')} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" value={form.newPassword} onChange={set('newPassword')} required />
              <div className="hint">8–16 chars, 1 uppercase &amp; 1 special character</div>
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} required />
            </div>
            <button className="btn" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
