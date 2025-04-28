const { poolPromise, sql } = require('../db/sqlConnection');

// GET /PermissionTypes
exports.getAllPermissionTypes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM PermissionTypes');
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllPermissionTypes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /PermissionTypes
exports.createPermissionType = async (req, res) => {
  try {
    const { permission_type } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('permission_type', sql.VarChar, permission_type)
      .query('INSERT INTO PermissionTypes (permission_type) VALUES (@permission_type)');

    res.status(201).json({ message: 'Permission type created' });
  } catch (err) {
    console.error('createPermissionType error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /PermissionTypes/:permission_type
exports.deletePermissionType = async (req, res) => {
  try {
    const { permission_type } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('permission_type', sql.VarChar, permission_type)
      .query('DELETE FROM PermissionTypes WHERE permission_type = @permission_type');

    res.json({ message: 'Permission type deleted' });
  } catch (err) {
    console.error('deletePermissionType error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 