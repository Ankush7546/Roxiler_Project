const pool = require('../config/db');
const { validateRating } = require('../utils/validators');

const STORE_SORT = { name: 's.name', address: 's.address', rating: 'overallRating' };
const dir = (order) => (String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC');

// Normal user: list all stores with overall rating + this user's submitted rating
exports.listStores = async (req, res) => {
  const { name = '', address = '', sortBy = 'name', order = 'asc' } = req.query;
  const sortCol = STORE_SORT[sortBy] || 's.name';

  try {
    const sql = `
      SELECT s.id, s.name, s.address,
             ROUND(AVG(r.rating), 2) AS overallRating,
             COUNT(r.id) AS ratingCount,
             ur.rating AS userRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
      WHERE s.name LIKE ? AND s.address LIKE ?
      GROUP BY s.id, ur.rating
      ORDER BY ${sortCol} ${dir(order)}`;
    const [rows] = await pool.query(sql, [req.user.id, `%${name}%`, `%${address}%`]);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Submit or modify a rating (upsert)
exports.submitRating = async (req, res) => {
  const { rating } = req.body;
  const storeId = req.params.storeId;
  const err = validateRating(rating);
  if (err) return res.status(400).json({ errors: [err] });

  try {
    const [store] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (!store.length) return res.status(404).json({ message: 'Store not found' });

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.user.id, storeId, rating]
    );
    return res.json({ message: 'Rating saved', storeId: Number(storeId), rating: Number(rating) });
  } catch (err2) {
    console.error(err2);
    return res.status(500).json({ message: 'Server error' });
  }
};
