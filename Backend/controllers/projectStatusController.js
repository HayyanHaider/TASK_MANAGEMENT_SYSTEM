const { poolPromise, sql } = require('../db/sqlConnection');

// GET /ProjectStatus
exports.getAllProjectStatuses = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM ProjectStatus');
    res.json(result.recordset);
  } catch (err) {
    console.error('getAllProjectStatuses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /ProjectStatus/:id
exports.getProjectStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM ProjectStatus WHERE status_id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Project status not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('getProjectStatusById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /ProjectStatus
exports.createProjectStatus = async (req, res) => {
  try {
    const { name, progress } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('name', sql.VarChar, name)
      .input('progress', sql.VarChar, progress)
      .query(`
        INSERT INTO ProjectStatus (name, progress)
        OUTPUT INSERTED.status_id
        VALUES (@name, @progress)
      `);

    res.status(201).json({ status_id: result.recordset[0].status_id });
  } catch (err) {
    console.error('createProjectStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /ProjectStatus/:id
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, progress } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, name)
      .input('progress', sql.VarChar, progress)
      .query(`
        UPDATE ProjectStatus
        SET name = @name,
            progress = @progress
        WHERE status_id = @id
      `);

    res.json({ message: 'Project status updated' });
  } catch (err) {
    console.error('updateProjectStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /ProjectStatus/:id
exports.deleteProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM ProjectStatus WHERE status_id = @id');

    res.json({ message: 'Project status deleted' });
  } catch (err) {
    console.error('deleteProjectStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 