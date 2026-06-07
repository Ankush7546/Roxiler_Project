// Seeds the database: runs schema then inserts sample users, stores, ratings.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const schema = fs.readFileSync(path.join(__dirname, '../config/schema.sql'), 'utf8');
    await conn.query(schema);
    await conn.query(`USE ${process.env.DB_NAME || 'store_rating'}`);

    // Clear existing data
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE ratings');
    await conn.query('TRUNCATE TABLE stores');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    const pw = await bcrypt.hash('Password@123', 10);

    // Names must be 20-60 chars per spec
    const [adminRes] = await conn.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['System Administrator Account', 'admin@example.com', pw, '1 Admin Plaza, Capital City', 'ADMIN']
    );

    const [u1] = await conn.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Jonathan Michael Anderson', 'user1@example.com', pw, '22 Maple Street, Springfield', 'USER']
    );
    const [u2] = await conn.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Elizabeth Catherine Morgan', 'user2@example.com', pw, '88 Oak Avenue, Riverside', 'USER']
    );

    const [owner1] = await conn.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Christopher Daniel Roberts', 'owner1@example.com', pw, '5 Commerce Road, Downtown', 'OWNER']
    );
    const [owner2] = await conn.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Margaret Josephine Williams', 'owner2@example.com', pw, '9 Market Lane, Old Town', 'OWNER']
    );

    const [s1] = await conn.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      ['Sunrise Grocery and Market', 'sunrise@store.com', '10 Sunrise Blvd, Downtown', owner1.insertId]
    );
    const [s2] = await conn.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      ['Evergreen Electronics Outlet', 'evergreen@store.com', '14 Tech Park, Midtown', owner2.insertId]
    );
    const [s3] = await conn.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      ['Riverside Books and Cafe Co', 'riverside@store.com', '3 River Walk, Riverside', null]
    );

    const ratings = [
      [u1.insertId, s1.insertId, 4],
      [u2.insertId, s1.insertId, 5],
      [u1.insertId, s2.insertId, 3],
      [u2.insertId, s2.insertId, 4],
      [u1.insertId, s3.insertId, 5],
    ];
    for (const r of ratings) {
      await conn.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', r);
    }

    console.log('Seed complete.');
    console.log('Login credentials (password for all): Password@123');
    console.log('  Admin: admin@example.com');
    console.log('  User:  user1@example.com');
    console.log('  Owner: owner1@example.com');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await conn.end();
  }
})();
