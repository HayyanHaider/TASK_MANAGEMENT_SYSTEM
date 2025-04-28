// /backend/controllers/roleController.js
const { poolPromise, sql } = require('../server');

exports.getAllRoles = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Roles');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('role_name', sql.NVarChar, role_name)
      .query('INSERT INTO Roles (role_name) VALUES (@role_name)');

    res.status(201).json({ message: 'Role created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Roles WHERE role_id = @id');

    res.json({ message: 'Role deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
