const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const {
  validateName, validateEmail, validatePassword, validateAddress, runValidations,
} = require('../utils/validators');

// Whitelist sortable columns to prevent SQL injection
const USER_SORT = { name: 'name', email: 'email', address: 'address', role: 'role', created_at: 'created_at' };
const STORE_SORT = { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' };

const dir = (order) => (String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC');

// Dashboard counts
exports.dashboard = async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query('SELECT COUNT(*) AS userCount FROM users');
    const [[{ storeCount }]] = await pool.query('SELECT COUNT(*) AS storeCount FROM stores');
    const [[{ ratingCount }]] = await pool.query('SELECT COUNT(*) AS ratingCount FROM ratings');
    return res.json({ userCount, storeCount, ratingCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin can create USER, ADMIN or OWNER
exports.createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const allowedRoles = ['USER', 'ADMIN', 'OWNER'];
  const errors = runValidations([
    validateName(name),
    validateEmail(email),
    validatePassword(password),
    validateAddress(address),
    allowedRoles.includes(role) ? null : 'Invalid role',
  ]);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address || null, role]
    );
    return res.status(201).json({ id: result.insertId, name, email, address, role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin can create a store; optionally link to an owner user
exports.createStore = async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  const errors = runValidations([
    validateName(name),
    validateEmail(email),
    validateAddress(address),
  ]);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Store email already exists' });

    if (ownerId) {
      const [owner] = await pool.query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (!owner.length) return res.status(400).json({ message: 'Owner not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address || null, ownerId || null]
    );
    return res.status(201).json({ id: result.insertId, name, email, address, ownerId: ownerId || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// List users with filters + sorting
exports.listUsers = async (req, res) => {
  const { name = '', email = '', address = '', role = '', sortBy = 'name', order = 'asc' } = req.query;
  const sortCol = USER_SORT[sortBy] || 'name';

  try {
    const params = [`%${name}%`, `%${email}%`, `%${address}%`];
    let sql = `SELECT id, name, email, address, role FROM users
               WHERE name LIKE ? AND email LIKE ? AND address LIKE ?`;
    if (role) { sql += ' AND role = ?'; params.push(role); }
    sql += ` ORDER BY ${sortCol} ${dir(order)}`;
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// User details; if OWNER, include their store's average rating
exports.userDetails = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    const user = rows[0];

    if (user.role === 'OWNER') {
      const [[agg]] = await pool.query(
        `SELECT ROUND(AVG(r.rating), 2) AS rating
         FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?`,
        [user.id]
      );
      user.rating = agg.rating;
    }
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// List stores with average rating + filters + sorting
exports.listStores = async (req, res) => {
  const { name = '', email = '', address = '', sortBy = 'name', order = 'asc' } = req.query;
  const sortCol = STORE_SORT[sortBy] || 's.name';

  try {
    const sql = `
      SELECT s.id, s.name, s.email, s.address,
             ROUND(AVG(r.rating), 2) AS rating,
             COUNT(r.id) AS ratingCount
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.name LIKE ? AND s.email LIKE ? AND s.address LIKE ?
      GROUP BY s.id
      ORDER BY ${sortCol} ${dir(order)}`;
    const [rows] = await pool.query(sql, [`%${name}%`, `%${email}%`, `%${address}%`]);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Helper list of owners for the create-store form
exports.listOwners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'OWNER' ORDER BY name"
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
