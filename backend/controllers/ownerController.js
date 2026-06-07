const pool = require('../config/db');

// Store owner dashboard: their store(s), average rating, and list of raters
exports.dashboard = async (req, res) => {
  try {
    const [stores] = await pool.query(
      'SELECT id, name, email, address FROM stores WHERE owner_id = ?',
      [req.user.id]
    );
    if (!stores.length) {
      return res.json({ stores: [], averageRating: null, raters: [] });
    }

    const storeIds = stores.map((s) => s.id);
    const placeholders = storeIds.map(() => '?').join(',');

    const [[agg]] = await pool.query(
      `SELECT ROUND(AVG(rating), 2) AS averageRating, COUNT(*) AS totalRatings
       FROM ratings WHERE store_id IN (${placeholders})`,
      storeIds
    );

    const [raters] = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.store_id AS storeId,
              s.name AS storeName, r.updated_at AS ratedAt
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       JOIN stores s ON s.id = r.store_id
       WHERE r.store_id IN (${placeholders})
       ORDER BY r.updated_at DESC`,
      storeIds
    );

    return res.json({
      stores,
      averageRating: agg.averageRating,
      totalRatings: agg.totalRatings,
      raters,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
