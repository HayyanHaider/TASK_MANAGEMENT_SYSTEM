const { poolPromise, sql } = require('../db/sqlConnection');

// GET /Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT t.*, ts.status_name as task_status, u.username as assigned_to_username
        FROM Tasks t
        JOIN TaskStatus ts ON t.status = ts.status_name
        LEFT JOIN Users u ON t.assigned_to = u.user_id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllTasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /Tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT t.*, ts.status_name as task_status, u.username as assigned_to_username
        FROM Tasks t
        JOIN TaskStatus ts ON t.status = ts.status_name
        LEFT JOIN Users u ON t.assigned_to = u.user_id
        WHERE t.task_id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('getTaskById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /Tasks
exports.createTask = async (req, res) => {
  try {
    const { project_id, title, description, assigned_to, status, priority } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('project_id', sql.Int, project_id)
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('assigned_to', sql.Int, assigned_to)
      .input('status', sql.VarChar, status)
      .input('priority', sql.VarChar, priority)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO Tasks (project_id, title, description, assigned_to, status, priority, created_at)
        OUTPUT INSERTED.task_id
        VALUES (@project_id, @title, @description, @assigned_to, @status, @priority, @created_at)
      `);

    res.status(201).json({ task_id: result.recordset[0].task_id });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /Tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, status, priority } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('assigned_to', sql.Int, assigned_to)
      .input('status', sql.VarChar, status)
      .input('priority', sql.VarChar, priority)
      .query(`
        UPDATE Tasks
        SET title = @title,
            description = @description,
            assigned_to = @assigned_to,
            status = @status,
            priority = @priority
        WHERE task_id = @id
      `);

    res.json({ message: 'Task updated' });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /Tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Tasks WHERE task_id = @id');

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /Tasks/project/:project_id
exports.getTasksByProjectId = async (req, res) => {
  try {
    const { project_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('project_id', sql.Int, project_id)
      .query(`
        SELECT t.*, ts.status_name as task_status, u.username as assigned_to_username
        FROM Tasks t
        JOIN TaskStatus ts ON t.status = ts.status_name
        LEFT JOIN Users u ON t.assigned_to = u.user_id
        WHERE t.project_id = @project_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getTasksByProjectId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /Tasks/user/:user_id
exports.getTasksByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT t.*, ts.status_name as task_status, u.username as assigned_to_username
        FROM Tasks t
        JOIN TaskStatus ts ON t.status = ts.status_name
        LEFT JOIN Users u ON t.assigned_to = u.user_id
        WHERE t.assigned_to = @user_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getTasksByUserId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 