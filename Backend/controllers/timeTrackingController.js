const { poolPromise, sql } = require('../db/sqlConnection');

// GET /TimeTracking
exports.getAllTimeEntries = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT tt.*, u.username as user_name, t.title as task_title,
               DATEDIFF(MINUTE, tt.start_time, ISNULL(tt.end_time, GETDATE())) as total_minutes
        FROM TimeTracking tt
        JOIN Users u ON tt.user_id = u.user_id
        JOIN Tasks t ON tt.task_id = t.task_id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllTimeEntries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /TimeTracking/:id
exports.getTimeEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT tt.*, u.username as user_name, t.title as task_title,
               DATEDIFF(MINUTE, tt.start_time, ISNULL(tt.end_time, GETDATE())) as total_minutes
        FROM TimeTracking tt
        JOIN Users u ON tt.user_id = u.user_id
        JOIN Tasks t ON tt.task_id = t.task_id
        WHERE tt.time_entry_id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('getTimeEntryById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /TimeTracking
exports.createTimeEntry = async (req, res) => {
  try {
    const { task_id, user_id, start_time, end_time } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('task_id', sql.Int, task_id)
      .input('user_id', sql.Int, user_id)
      .input('start_time', sql.DateTime, start_time)
      .input('end_time', sql.DateTime, end_time)
      .query(`
        INSERT INTO TimeTracking (task_id, user_id, start_time, end_time)
        OUTPUT INSERTED.time_entry_id
        VALUES (@task_id, @user_id, @start_time, @end_time)
      `);

    res.status(201).json({ time_entry_id: result.recordset[0].time_entry_id });
  } catch (err) {
    console.error('createTimeEntry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /TimeTracking/:id
exports.updateTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('start_time', sql.DateTime, start_time)
      .input('end_time', sql.DateTime, end_time)
      .query(`
        UPDATE TimeTracking
        SET start_time = @start_time,
            end_time = @end_time
        WHERE time_entry_id = @id
      `);

    res.json({ message: 'Time entry updated' });
  } catch (err) {
    console.error('updateTimeEntry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /TimeTracking/:id
exports.deleteTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM TimeTracking WHERE time_entry_id = @id');

    res.json({ message: 'Time entry deleted' });
  } catch (err) {
    console.error('deleteTimeEntry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /TimeTracking/task/:task_id
exports.getTimeEntriesByTaskId = async (req, res) => {
  try {
    const { task_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('task_id', sql.Int, task_id)
      .query(`
        SELECT tt.*, u.username as user_name,
               DATEDIFF(MINUTE, tt.start_time, ISNULL(tt.end_time, GETDATE())) as total_minutes
        FROM TimeTracking tt
        JOIN Users u ON tt.user_id = u.user_id
        WHERE tt.task_id = @task_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getTimeEntriesByTaskId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /TimeTracking/user/:user_id
exports.getTimeEntriesByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT tt.*, t.title as task_title,
               DATEDIFF(MINUTE, tt.start_time, ISNULL(tt.end_time, GETDATE())) as total_minutes
        FROM TimeTracking tt
        JOIN Tasks t ON tt.task_id = t.task_id
        WHERE tt.user_id = @user_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getTimeEntriesByUserId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /TimeTracking/user/:user_id/total
exports.getTotalTimeByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT SUM(DATEDIFF(MINUTE, start_time, ISNULL(end_time, GETDATE()))) as total_minutes
        FROM TimeTracking
        WHERE user_id = @user_id
      `);

    res.json({ total_minutes: result.recordset[0].total_minutes || 0 });
  } catch (err) {
    console.error('getTotalTimeByUserId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 