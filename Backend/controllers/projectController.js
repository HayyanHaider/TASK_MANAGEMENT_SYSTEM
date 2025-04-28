// /backend/controllers/projectController.js
const { poolPromise, sql } = require('../db/sqlConnection');

// GET /Projects
exports.getAllProjects = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Projects');
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllProjects error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /Projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Projects WHERE project_id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('getProjectById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /Projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, created_by } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('name',        sql.NVarChar, name)
      .input('description', sql.Text,     description)
      .input('created_by',  sql.Int,      created_by)
      .input('created_at',  sql.DateTime, new Date())
      .query(`
        INSERT INTO Projects (name, description, created_by, created_at)
        OUTPUT INSERTED.project_id
        VALUES (@name, @description, @created_by, @created_at)
      `);

    res.status(201).json({ project_id: result.recordset[0].project_id });
  } catch (err) {
    console.error('createProject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /Projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id',          sql.Int,      id)
      .input('name',        sql.NVarChar, name)
      .input('description', sql.Text,     description)
      .query(`
        UPDATE Projects
        SET name = @name,
            description = @description
        WHERE project_id = @id
      `);

    res.json({ message: 'Project updated' });
  } catch (err) {
    console.error('updateProject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /Projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Projects WHERE project_id = @id');

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('deleteProject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
