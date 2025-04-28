// /backend/controllers/adminController.js

const { poolPromise, sql } = require('../db/sqlConnection');

// Fetch all users
async function getUsers(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query('SELECT user_id, username, email, role_id, created_at FROM Users');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// Add new user (plain-text password stored directly as password_hash)
async function addUser(req, res) {
  const { username, email, password, password_hash, role_id } = req.body;

  const actualPassword = password || password_hash;

  if (!username || !email || !actualPassword || !role_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('username',      sql.NVarChar,  username)
      .input('email',         sql.NVarChar,  email)
      .input('password_hash', sql.NVarChar,  actualPassword)
      .input('role_id',       sql.Int,       role_id)
      .input('created_at',    sql.DateTime,  new Date())
      .query(`
        INSERT INTO Users
          (username, email, password_hash, role_id, created_at)
        VALUES
          (@username, @email, @password_hash, @role_id, @created_at)
      `);

    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Failed to add user' });
  }
}

// Fetch all projects
async function getProjects(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query('SELECT project_id, name, description, created_by, created_at FROM Projects');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// Fetch single project
async function getProject(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT project_id, name, description, created_by, created_at
        FROM Projects
        WHERE project_id = @projectId
      `);
    res.json(result.recordset[0] || {});
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

// Update project
async function updateProject(req, res) {
  const { projectId } = req.params;
  const { name, description, created_at } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('name',        sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('created_at',  sql.DateTime, new Date(created_at))
      .input('projectId',   sql.Int,      projectId)
      .query(`
        UPDATE Projects
        SET name = @name,
            description = @description,
            created_at = @created_at
        WHERE project_id = @projectId
      `);
    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

// Fetch all tasks
async function listTasks(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`
        SELECT task_id, title, project_id, status, priority, assigned_to, created_at
        FROM Tasks
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// Assign task
async function assignTask(req, res) {
  const { taskId } = req.params;
  const { userId } = req.body;
  if (!taskId || !userId) return res.status(400).json({ error: 'Missing taskId or userId' });

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('assigned_to', sql.Int, userId)
      .input('taskId',      sql.Int, taskId)
      .query(`
        UPDATE Tasks
        SET assigned_to = @assigned_to
        WHERE task_id = @taskId
      `);
    res.json({ message: 'Task assigned successfully' });
  } catch (err) {
    console.error('Error assigning task:', err);
    res.status(500).json({ error: 'Failed to assign task' });
  }
}

// DELETE a project and all its dependents
async function deleteProject(req, res) {
  const { projectId } = req.params;

  try {
    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);
    await tx.begin();

    const rq = tx.request().input('projectId', sql.Int, projectId);

    // 1) Delete from tables referencing the project
    try {
      // First check if the project exists
      const projectCheck = await rq.query(`
        SELECT project_id FROM Projects WHERE project_id = @projectId
      `);
      
      if (projectCheck.recordset.length === 0) {
        throw new Error('Project not found');
      }

      // Delete dependencies for tasks in this project
      await rq.query(`
        DELETE FROM Dependencies
        WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId)
           OR depends_on_task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId);
      `);
      console.log('✅ Dependencies deleted');

      // Delete subtasks for tasks in this project
      await rq.query(`
        DELETE FROM Subtasks
        WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId);
      `);
      console.log('✅ Subtasks deleted');

      // Delete comments for tasks in this project
      await rq.query(`
        DELETE FROM Comments
        WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId);
      `);
      console.log('✅ Comments deleted');

      // Delete attachments for tasks in this project
      await rq.query(`
        DELETE FROM Attachments
        WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId);
      `);
      console.log('✅ Attachments deleted');

      // Delete task permissions for tasks in this project
      await rq.query(`
        DELETE FROM TaskPermissions
        WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId);
      `);
      console.log('✅ TaskPermissions deleted');

      // Delete time tracking for tasks in this project
      await rq.query(`
        DELETE FROM TimeTracking
        WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId);
      `);
      console.log('✅ TimeTracking deleted');

      // Delete feedback for tasks in this project
      await rq.query(`
        DELETE FROM Feedback
        WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = @projectId)
           OR project_id = @projectId;
      `);
      console.log('✅ Feedback deleted');

      // Delete statuses for this project
      await rq.query(`
        DELETE FROM Statuses
        WHERE project_id = @projectId;
      `);
      console.log('✅ Statuses deleted');

      // Delete budget for this project
      await rq.query(`
        DELETE FROM Budget
        WHERE project_id = @projectId;
      `);
      console.log('✅ Budget deleted');

      // Delete tasks in this project
      await rq.query(`
        DELETE FROM Tasks
        WHERE project_id = @projectId;
      `);
      console.log('✅ Tasks deleted');

      // Finally delete the project itself
      await rq.query(`
        DELETE FROM Projects
        WHERE project_id = @projectId;
      `);
      console.log('✅ Project deleted');

      await tx.commit();
      console.log('✅ Transaction committed successfully');
      res.json({ message: 'Project and all related data deleted successfully' });
    } catch (err) {
      console.error('❌ Error during deletion operations:', err);
      throw err; // Re-throw to trigger rollback
    }
  } catch (err) {
    console.error('❌ Error deleting project and dependencies:', err);
    try {
      await tx.rollback();
      console.log('✅ Transaction rolled back successfully');
    } catch (rollbackErr) {
      console.error('❌ Error rolling back transaction:', rollbackErr);
    }
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
}


// GET /admin/projects/:projectId/details
async function getProjectDetails(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;

    // 1) Fetch project
    const projRes = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT project_id, name, description, created_by, created_at
        FROM Projects
        WHERE project_id = @projectId
      `);
    const project = projRes.recordset[0];
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // 2) Fetch tasks + assigned user info
    const tasksRes = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT
          t.task_id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.created_at,
          u.user_id,
          u.username,
          u.email
        FROM Tasks AS t
        LEFT JOIN Users AS u
          ON t.assigned_to = u.user_id
        WHERE t.project_id = @projectId
        ORDER BY t.task_id
      `);

    res.json({
      project,
      tasks: tasksRes.recordset
    });
  } catch (err) {
    console.error('❌ Error fetching project details:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getUsers,
  addUser,
  getProjects,
  getProject,
  updateProject,
  listTasks,
  assignTask,
  deleteProject,     // <<< export it
  getProjectDetails
};