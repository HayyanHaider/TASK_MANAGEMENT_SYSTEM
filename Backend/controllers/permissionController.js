// /backend/controllers/permissionController.js
const { poolPromise, sql } = require('../server');

exports.getAllPermissions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Permissions');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { role_id, task_id, can_edit, can_delete, can_assign } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('role_id',   sql.Int,   role_id)
      .input('task_id',   sql.Int,   task_id)
      .input('can_edit',  sql.Bit,   can_edit)
      .input('can_delete',sql.Bit,   can_delete)
      .input('can_assign',sql.Bit,   can_assign)
      .query(`
        INSERT INTO Permissions (role_id, task_id, can_edit, can_delete, can_assign)
        VALUES (@role_id, @task_id, @can_edit, @can_delete, @can_assign)
      `);

    res.status(201).json({ message: 'Permission created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { can_edit, can_delete, can_assign } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id',         sql.Int, id)
      .input('can_edit',   sql.Bit, can_edit)
      .input('can_delete', sql.Bit, can_delete)
      .input('can_assign', sql.Bit, can_assign)
      .query(`
        UPDATE Permissions
        SET can_edit   = @can_edit,
            can_delete = @can_delete,
            can_assign = @can_assign
        WHERE permission_id = @id
      `);

    res.json({ message: 'Permission updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Permissions WHERE permission_id = @id');

    res.json({ message: 'Permission deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
