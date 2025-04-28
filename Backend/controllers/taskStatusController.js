const { poolPromise, sql } = require('../db/sqlConnection');

// GET /TaskStatus
exports.getAllTaskStatuses = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM TaskStatus');
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllTaskStatuses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /TaskStatus
exports.createTaskStatus = async (req, res) => {
  try {
    const { status_name } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('status_name', sql.VarChar, status_name)
      .query('INSERT INTO TaskStatus (status_name) VALUES (@status_name)');

    res.status(201).json({ message: 'Task status created' });
  } catch (err) {
    console.error('createTaskStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /TaskStatus/:status_name
exports.deleteTaskStatus = async (req, res) => {
  try {
    const { status_name } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('status_name', sql.VarChar, status_name)
      .query('DELETE FROM TaskStatus WHERE status_name = @status_name');

    res.json({ message: 'Task status deleted' });
  } catch (err) {
    console.error('deleteTaskStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 