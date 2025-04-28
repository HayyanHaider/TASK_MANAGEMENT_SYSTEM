const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../db/sqlConnection');
require('dotenv').config();

// LOGIN Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const request = pool.request();

    const result = await request
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: email not found' });
    }

    if (password !== user.password_hash) {
      return res.status(400).json({ message: 'Invalid credentials: password incorrect' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ 
      token,
      user_id: user.user_id,
      role_id: user.role_id
    });

  } catch (err) {
    console.error('❌ login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// REGISTER Controller
exports.register = async (req, res) => {
  const { username, email, password, role_id } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Check email existence
    const checkRequest = pool.request();
    const existing = await checkRequest
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.log('✅ Email is unique, proceeding to insert user.');

    // Step 2: Insert user (fresh request)
    const insertRequest = pool.request();
    await insertRequest
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, password) 
      .input('role_id', sql.Int, role_id)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO Users (username, email, password_hash, role_id, created_at)
        VALUES (@username, @email, @password_hash, @role_id, @created_at)
      `);

    console.log('✅ New user inserted successfully.');
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error('❌ Registration error:', err.message);
    console.error('❌ Full error:', err);
    res.status(500).json({ error: "Server error during registration" });
  }
};
