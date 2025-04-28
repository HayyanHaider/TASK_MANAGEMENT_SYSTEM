// /backend/controllers/pmController.js
const { poolPromise, sql } = require('../db/sqlConnection');

// 1) List all projects for this PM
async function getProjectsByManager(req, res) {
  const pmId = req.user.user_id;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('created_by', sql.Int, pmId)
      .query(`
        SELECT project_id, name, description, created_at
        FROM Projects
        WHERE created_by = @created_by
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
}

// 2) Get single project
async function getProjectById(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT project_id, name, description, created_at
        FROM Projects
        WHERE project_id = @projectId
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching project' });
  }
}

// 3) Create project
async function createProject(req, res) {
  const pmId = req.user.user_id;
  const { name, description } = req.body;
  try {
    const pool = await poolPromise;
    const insert = await pool.request()
      .input('name',        sql.NVarChar, name)
      .input('description', sql.Text,     description)
      .input('created_by',  sql.Int,      pmId)
      .query(`
        INSERT INTO Projects (project_id, name, description, created_by, created_at)
        VALUES ((SELECT ISNULL(MAX(project_id),0)+1 FROM Projects), @name, @description, @created_by, GETDATE())
      `);
    res.status(201).json({ message: 'Project created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating project' });
  }
}

// 4) Update project
async function updateProject(req, res) {
  const { projectId } = req.params;
  const { name, description } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('projectId',   sql.Int,      projectId)
      .input('name',        sql.NVarChar, name)
      .input('description', sql.Text,     description)
      .query(`
        UPDATE Projects
        SET name = @name,
            description = @description
        WHERE project_id = @projectId
      `);
    res.json({ message: 'Project updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating project' });
  }
}

// 5) Delete project
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

// 6) List tasks in a project
async function getTasksByProject(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT task_id, title, status, priority, assigned_to, created_at
        FROM Tasks
        WHERE project_id = @projectId
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
}


// 8) Update a task
async function updateTask(req, res) {
  const { taskId } = req.params;
  const { title, description, status, priority, assigned_to } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('taskId',     sql.Int,       taskId)
      .input('title',      sql.NVarChar, title)
      .input('description',sql.Text,      description)
      .input('status',     sql.NVarChar, status)
      .input('priority',   sql.NVarChar, priority)
      .input('assigned_to',sql.Int,       assigned_to)
      .query(`
        UPDATE Tasks
        SET title = @title,
            description = @description,
            status = @status,
            priority = @priority,
            assigned_to = @assigned_to
        WHERE task_id = @taskId
      `);
    res.json({ message: 'Task updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating task' });
  }
}

// 9) Delete a task
// Delete a single task and all its dependencies
async function deleteTask(req, res) {
  const { taskId } = req.params;

  try {
    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);
    await tx.begin();

    const rq = tx.request().input('taskId', sql.Int, taskId);

    // 1) Delete from tables referencing the task
    try {
      // First check if the task exists
      const taskCheck = await rq.query(`
        SELECT task_id FROM Tasks WHERE task_id = @taskId
      `);
      
      if (taskCheck.recordset.length === 0) {
        throw new Error('Task not found');
      }

      // Delete dependencies
      await rq.query(`
        DELETE FROM Dependencies
        WHERE task_id = @taskId OR depends_on_task_id = @taskId;
      `);
      console.log('✅ Dependencies deleted');

      // Delete subtasks
      await rq.query(`
        DELETE FROM Subtasks
        WHERE task_id = @taskId;
      `);
      console.log('✅ Subtasks deleted');

      // Delete comments
      await rq.query(`
        DELETE FROM Comments
        WHERE task_id = @taskId;
      `);
      console.log('✅ Comments deleted');

      // Delete attachments
      await rq.query(`
        DELETE FROM Attachments
        WHERE task_id = @taskId;
      `);
      console.log('✅ Attachments deleted');

      // Delete task permissions
      await rq.query(`
        DELETE FROM TaskPermissions
        WHERE task_id = @taskId;
      `);
      console.log('✅ TaskPermissions deleted');

      // Delete time tracking
      await rq.query(`
        DELETE FROM TimeTracking
        WHERE task_id = @taskId;
      `);
      console.log('✅ TimeTracking deleted');

      // Delete feedback
      await rq.query(`
        DELETE FROM Feedback
        WHERE task_id = @taskId;
      `);
      console.log('✅ Feedback deleted');

      // Finally delete the task itself
      await rq.query(`
        DELETE FROM Tasks
        WHERE task_id = @taskId;
      `);
      console.log('✅ Task deleted');

      await tx.commit();
      console.log('✅ Transaction committed successfully');
      res.json({ message: 'Task and all related data deleted successfully' });
    } catch (err) {
      console.error('❌ Error during deletion operations:', err);
      throw err; // Re-throw to trigger rollback
    }
  } catch (err) {
    console.error('❌ Error deleting task and its dependencies:', err);
    try {
      await tx.rollback();
      console.log('✅ Transaction rolled back successfully');
    } catch (rollbackErr) {
      console.error('❌ Error rolling back transaction:', rollbackErr);
    }
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
}

// 10) List subtasks for a task
async function getSubtasksByTask(req, res) {
  const { taskId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('taskId', sql.Int, taskId)
      .query(`
        SELECT subtask_id, title, status
        FROM Subtasks
        WHERE task_id = @taskId
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching subtasks' });
  }
}

// 11) Create subtask
async function createSubtask(req, res) {
    const { taskId } = req.params;
    const { title }  = req.body;
  
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
  
    try {
      const pool = await poolPromise;
      // auto-increment subtask_id
      await pool.request()
        .input('subtaskId', sql.Int,   0)
        .input('taskId',    sql.Int,   taskId)
        .input('title',     sql.NVarChar, title)
        .query(`
          INSERT INTO Subtasks (subtask_id, task_id, title)
          VALUES ((SELECT ISNULL(MAX(subtask_id),0)+1 FROM Subtasks),
                  @taskId, @title)
        `);
  
      res.status(201).json({ message: 'Subtask created' });
    } catch (err) {
      console.error('Error creating subtask:', err);
      res.status(500).json({ error: 'Failed to create subtask' });
    }
  }
  

// 12) Update subtask
async function updateSubtask(req, res) {
  const { subtaskId } = req.params;
  const { title, status } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('subtaskId', sql.Int, subtaskId)
      .input('title',     sql.NVarChar, title)
      .input('status',    sql.NVarChar, status)
      .query(`
        UPDATE Subtasks
        SET title = @title,
            status = @status
        WHERE subtask_id = @subtaskId
      `);
    res.json({ message: 'Subtask updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating subtask' });
  }
}

// 13) Delete subtask
async function deleteSubtask(req, res) {
  const { subtaskId } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('subtaskId', sql.Int, subtaskId)
      .query(`DELETE FROM Subtasks WHERE subtask_id = @subtaskId`);
    res.json({ message: 'Subtask deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting subtask' });
  }
}


// 3) ADD/CREATE a task (now accepts assigned_to)
async function createTask(req, res) {
  const { projectId } = req.params;
  const { title, description, priority, assigned_to } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('taskId',      sql.Int,       0)
      .input('projectId',   sql.Int,       projectId)
      .input('title',       sql.NVarChar,  title)
      .input('description', sql.Text,      description)
      .input('assigned_to', sql.Int,       assigned_to || null)
      .input('priority',    sql.NVarChar,  priority || 'Medium')  // ✅ fallback to 'Medium'
      .query(`
        INSERT INTO Tasks
          (task_id, project_id, title, description, assigned_to, priority, created_at)
        VALUES
          ((SELECT ISNULL(MAX(task_id),0)+1 FROM Tasks),
           @projectId, @title, @description, @assigned_to, @priority, GETDATE())
      `);

    res.status(201).json({ message: 'Task created' });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Error creating task' });
  }
}

  
  // 14) Get full project details (project + tasks + subtasks + assigned user info)
  async function getFullProjectDetails(req, res) {
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
            u.user_id   AS assigned_to,
            u.username,
            u.email
          FROM Tasks AS t
          LEFT JOIN Users AS u
            ON t.assigned_to = u.user_id
          WHERE t.project_id = @projectId
          ORDER BY t.task_id
        `);
      const tasks = tasksRes.recordset;
  
      // 3) Fetch subtasks for each task
      for (let task of tasks) {
        const subRes = await pool.request()
          .input('taskId', sql.Int, task.task_id)
          .query(`
            SELECT subtask_id, title, status
            FROM Subtasks
            WHERE task_id = @taskId
          `);
        task.subtasks = subRes.recordset;
      }
  
      // 4) Send full project with tasks embedded
      res.json({ project, tasks });
    } catch (err) {
      console.error('Error fetching full project details:', err);
      res.status(500).json({ error: 'Error fetching project details' });
    }
  }

  module.exports = {
    getProjectsByManager,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    getSubtasksByTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    getFullProjectDetails // <<=== ADD THIS
  };
  