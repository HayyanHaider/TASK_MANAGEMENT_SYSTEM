const { poolPromise, sql } = require('../db/sqlConnection');

// GET /Feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT f.*, u.username as user_name,
               t.title as task_title,
               p.name as project_name
        FROM Feedback f
        JOIN Users u ON f.user_id = u.user_id
        LEFT JOIN Tasks t ON f.task_id = t.task_id
        LEFT JOIN Projects p ON f.project_id = p.project_id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllFeedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /Feedback/:id
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT f.*, u.username as user_name,
               t.title as task_title,
               p.name as project_name
        FROM Feedback f
        JOIN Users u ON f.user_id = u.user_id
        LEFT JOIN Tasks t ON f.task_id = t.task_id
        LEFT JOIN Projects p ON f.project_id = p.project_id
        WHERE f.feedback_id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('getFeedbackById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /Feedback
exports.createFeedback = async (req, res) => {
  try {
    const { user_id, task_id, project_id, feedback_text, rating } = req.body;
    const pool = await poolPromise;

    // Validate that either task_id or project_id is provided, but not both
    if ((!task_id && !project_id) || (task_id && project_id)) {
      return res.status(400).json({ error: 'Feedback must be associated with either a task or a project, but not both' });
    }

    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('task_id', sql.Int, task_id)
      .input('project_id', sql.Int, project_id)
      .input('feedback_text', sql.Text, feedback_text)
      .input('rating', sql.Int, rating)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO Feedback (user_id, task_id, project_id, feedback_text, rating, created_at)
        OUTPUT INSERTED.feedback_id
        VALUES (@user_id, @task_id, @project_id, @feedback_text, @rating, @created_at)
      `);

    res.status(201).json({ feedback_id: result.recordset[0].feedback_id });
  } catch (err) {
    console.error('createFeedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /Feedback/:id
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_text, rating } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('feedback_text', sql.Text, feedback_text)
      .input('rating', sql.Int, rating)
      .query(`
        UPDATE Feedback
        SET feedback_text = @feedback_text,
            rating = @rating
        WHERE feedback_id = @id
      `);

    res.json({ message: 'Feedback updated' });
  } catch (err) {
    console.error('updateFeedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /Feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Feedback WHERE feedback_id = @id');

    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error('deleteFeedback error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /Feedback/task/:task_id
exports.getFeedbackByTaskId = async (req, res) => {
  try {
    const { task_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('task_id', sql.Int, task_id)
      .query(`
        SELECT f.*, u.username as user_name
        FROM Feedback f
        JOIN Users u ON f.user_id = u.user_id
        WHERE f.task_id = @task_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getFeedbackByTaskId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /Feedback/project/:project_id
exports.getFeedbackByProjectId = async (req, res) => {
  try {
    const { project_id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('project_id', sql.Int, project_id)
      .query(`
        SELECT f.*, u.username as user_name
        FROM Feedback f
        JOIN Users u ON f.user_id = u.user_id
        WHERE f.project_id = @project_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('getFeedbackByProjectId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 