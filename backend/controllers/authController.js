const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
  validateName, validateEmail, validatePassword, validateAddress, runValidations,
} = require('../utils/validators');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// Public registration -> always creates a Normal User
exports.signup = async (req, res) => {
  const { name, email, password, address } = req.body;
  const errors = runValidations([
    validateName(name),
    validateEmail(email),
    validatePassword(password),
    validateAddress(address),
  ]);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address || null, 'USER']
    );
    const user = { id: result.insertId, name, email, role: 'USER' };
    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({ token: signToken(safe), user: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const pwErr = validatePassword(newPassword);
  if (pwErr) return res.status(400).json({ errors: [pwErr] });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
