// /backend/controllers/userController.js
const { poolPromise, sql } = require('../server');

exports.getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Users');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE user_id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password_hash, role_id, created_at } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, password_hash)
      .input('role_id', sql.Int, role_id)
      .input('created_at', sql.DateTime, new Date(created_at))
      .query(`
        INSERT INTO Users (username, email, password_hash, role_id, created_at)
        OUTPUT INSERTED.user_id
        VALUES (@username, @email, @password_hash, @role_id, @created_at)
      `);

    res.status(201).json({ user_id: result.recordset[0].user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('role_id', sql.Int, role_id)
      .query(`
        UPDATE Users
        SET username = @username,
            email    = @email,
            role_id  = @role_id
        WHERE user_id = @id
      `);

    res.json({ message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Users WHERE user_id = @id');

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
