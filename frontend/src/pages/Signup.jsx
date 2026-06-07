import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validators';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      const data = err.response?.data;
      setServerError(data?.message || (data?.errors && data.errors.join(', ')) || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-sub">Join to rate your favourite stores.</p>
        {serverError && <div className="alert alert-error">{serverError}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Full Name</label>
            <input value={form.name} onChange={set('name')} />
            {errors.name ? <div className="err">{errors.name}</div>
              : <div className="hint">Between 20 and 60 characters</div>}
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} />
            {errors.email && <div className="err">{errors.email}</div>}
          </div>
          <div className="field">
            <label>Address</label>
            <textarea rows="2" value={form.address} onChange={set('address')} />
            {errors.address ? <div className="err">{errors.address}</div>
              : <div className="hint">Max 400 characters</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} />
            {errors.password ? <div className="err">{errors.password}</div>
              : <div className="hint">8–16 chars, 1 uppercase &amp; 1 special character</div>}
          </div>
          <button className="btn btn-block" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
