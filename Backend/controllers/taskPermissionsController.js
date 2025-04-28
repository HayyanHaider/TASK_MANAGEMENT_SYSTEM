const { poolPromise, sql } = require('../db/sqlConnection');

// GET /TaskPermissions
exports.getAllTaskPermissions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT tp.*, p.permission_type, r.role_name, t.title as task_title
        FROM TaskPermissions tp
        JOIN Permissions p ON tp.permission_id = p.permission_id
        JOIN Roles r ON p.role_id = r.role_id
        JOIN Tasks t ON tp.task_id = t.task_id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllTaskPermissions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /TaskPermissions/task/:task_id
exports.getTaskPermissionsByTaskId = async (req, res) => {
  try {
    const { task_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('task_id', sql.Int, task_id)
      .query(`
        SELECT tp.*, p.permission_type, r.role_name
        FROM TaskPermissions tp
        JOIN Permissions p ON tp.permission_id = p.permission_id
        JOIN Roles r ON p.role_id = r.role_id
        WHERE tp.task_id = @task_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getTaskPermissionsByTaskId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /TaskPermissions
exports.createTaskPermission = async (req, res) => {
  try {
    const { permission_id, task_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('permission_id', sql.Int, permission_id)
      .input('task_id', sql.Int, task_id)
      .query(`
        INSERT INTO TaskPermissions (permission_id, task_id)
        VALUES (@permission_id, @task_id)
      `);

    res.status(201).json({ message: 'Task permission created' });
  } catch (err) {
    console.error('createTaskPermission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /TaskPermissions
exports.deleteTaskPermission = async (req, res) => {
  try {
    const { permission_id, task_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('permission_id', sql.Int, permission_id)
      .input('task_id', sql.Int, task_id)
      .query(`
        DELETE FROM TaskPermissions
        WHERE permission_id = @permission_id AND task_id = @task_id
      `);

    res.json({ message: 'Task permission deleted' });
  } catch (err) {
    console.error('deleteTaskPermission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 