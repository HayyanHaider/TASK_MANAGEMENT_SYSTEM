// /backend/controllers/clientController.js
const { poolPromise, sql } = require('../db/sqlConnection');


// 0) Get all tasks + subtasks for a project (Client view)
async function getTasks(req, res) {
    const { projectId } = req.params;
    try {
      const pool = await poolPromise;
      const tasksRes = await pool.request()
        .input('projectId', sql.Int, projectId)
        .query(`
          SELECT 
            t.task_id, t.title, t.description, t.status, t.priority, t.created_at
          FROM Tasks t
          WHERE t.project_id = @projectId
          ORDER BY t.created_at DESC
        `);
      const tasks = tasksRes.recordset;
  
      // Fetch subtasks for each task
      for (let task of tasks) {
        const subtaskRes = await pool.request()
          .input('taskId', sql.Int, task.task_id)
          .query(`
            SELECT subtask_id, title, status
            FROM Subtasks
            WHERE task_id = @taskId
          `);
        task.subtasks = subtaskRes.recordset;
      }
  
      res.json(tasks);
    } catch (err) {
      console.error('Error fetching client tasks:', err);
      res.status(500).json({ error: 'Failed to load tasks' });
    }
  }
  

// 1) List all projects for this client
async function getProjects(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT
          p.project_id,
          p.name,
          p.description,
          p.created_at,
          p.created_by,
          ps.name AS status,
          ps.progress
        FROM Projects p
        LEFT JOIN Statuses s ON p.project_id = s.project_id
        LEFT JOIN ProjectStatus ps ON s.status_name = ps.name
        ORDER BY p.created_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ getProjects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// 2) Full project details (including tasks & subtasks)
async function getProjectDetails(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;

    // Project core with status
    const proj = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT
          p.project_id,
          p.name,
          p.description,
          p.created_at,
          u.username AS manager,
          s.status_name AS status
        FROM Projects p
        LEFT JOIN Users u ON p.created_by = u.user_id
        LEFT JOIN Statuses s ON p.project_id = s.project_id
        WHERE p.project_id = @projectId
      `);
    if (!proj.recordset.length) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Tasks + assigned user
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
          u.user_id AS assigned_to,
          u.username,
          u.email
        FROM Tasks t
        LEFT JOIN Users u ON t.assigned_to = u.user_id
        WHERE t.project_id = @projectId
        ORDER BY t.task_id
      `);

    // Subtasks per task
    const tasks = tasksRes.recordset;
    for (let t of tasks) {
      const sub = await pool.request()
        .input('taskId', sql.Int, t.task_id)
        .query(`
          SELECT
            subtask_id,
            title,
            status
          FROM Subtasks
          WHERE task_id = @taskId
        `);
      t.subtasks = sub.recordset;
    }

    const response = {
      project: {
        ...proj.recordset[0],
        tasks: tasks
      }
    };

    res.json(response);
  } catch (err) {
    console.error('❌ getProjectDetails error:', err);
    res.status(500).json({ error: 'Failed to load project details' });
  }
}

// 3) Budget info
async function getBudget(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT
          allocated_budget,
          spent_budget,
          remaining_budget
        FROM Budget
        WHERE project_id = @projectId
      `);
    res.json(result.recordset[0] || {});
  } catch (err) {
    console.error('❌ getBudget error:', err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
}

// 4) Comments on project
async function getComments(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT
          c.comment_id,
          c.task_id,
          c.user_id,
          u.username,
          c.comment,
          c.created_at
        FROM Comments c
        JOIN Tasks t ON c.task_id = t.task_id
        JOIN Users u ON c.user_id = u.user_id
        WHERE t.project_id = @projectId
        ORDER BY c.created_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ getComments error:', err);
    res.status(500).json({ error: 'Failed to load comments' });
  }
}

// 5) Attachments on project
async function getAttachments(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT
          a.attachment_id,
          a.attachment_name,
          a.attachment_type,
          a.file_path,
          a.uploaded_at,
          t.task_id,
          t.title AS task_title
        FROM Attachments a
        JOIN Tasks t ON a.task_id = t.task_id
        WHERE t.project_id = @projectId
        ORDER BY a.uploaded_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ getAttachments error:', err);
    res.status(500).json({ error: 'Failed to load attachments' });
  }
}

// 6) Time‑tracking for project
async function getTimeTracking(req, res) {
  const { projectId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT
          tt.time_entry_id,
          tt.task_id,
          tt.user_id,
          u.username,
          tt.start_time,
          tt.end_time,
          DATEDIFF(MINUTE, tt.start_time, ISNULL(tt.end_time, GETDATE())) as total_time
        FROM TimeTracking tt
        JOIN Tasks t ON tt.task_id = t.task_id
        JOIN Users u ON tt.user_id = u.user_id
        WHERE t.project_id = @projectId
        ORDER BY tt.start_time DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ getTimeTracking error:', err);
    res.status(500).json({ error: 'Failed to load time tracking' });
  }
}

// 7) Submit feedback on project/task
async function submitFeedback(req, res) {
  try {
    const userId = req.user.user_id;
    const { project_id, task_id, feedback_text, rating } = req.body;

    console.log('Raw request body:', req.body);
    console.log('Feedback submission attempt:', { userId, project_id, task_id, feedback_text, rating });

    // Validate required fields
    if (!feedback_text || !rating) {
      return res.status(400).json({ 
        error: 'feedback_text and rating are required',
        received: { feedback_text, rating }
      });
    }

    // Validate that either task_id or project_id is provided
    if (!task_id && !project_id) {
      return res.status(400).json({ 
        error: 'Either task_id or project_id must be provided',
        received: { task_id, project_id }
      });
    }

    const pool = await poolPromise;
    
    // Get the next feedback_id
    const maxIdResult = await pool.request()
      .query('SELECT MAX(feedback_id) as maxId FROM Feedback');
    const nextId = (maxIdResult.recordset[0].maxId || 0) + 1;
    
    console.log('Next feedback ID:', nextId);

    // Prepare the insert query based on whether it's task or project feedback
    const insertQuery = `
      INSERT INTO Feedback (
        feedback_id,
        user_id,
        ${task_id ? 'task_id' : 'project_id'},
        feedback_text,
        rating,
        created_at
      ) VALUES (
        @feedback_id,
        @user_id,
        @${task_id ? 'task_id' : 'project_id'},
        @feedback_text,
        @rating,
        GETDATE()
      )
    `;

    console.log('Insert query:', insertQuery);

    // Insert feedback
    const result = await pool.request()
      .input('feedback_id', sql.Int, nextId)
      .input('user_id', sql.Int, userId)
      .input(task_id ? 'task_id' : 'project_id', sql.Int, task_id || project_id)
      .input('feedback_text', sql.Text, feedback_text)
      .input('rating', sql.Int, rating)
      .query(insertQuery);

    console.log('Insert result:', result);

    // Verify the feedback was inserted
    const verifyResult = await pool.request()
      .input('feedback_id', sql.Int, nextId)
      .query('SELECT * FROM Feedback WHERE feedback_id = @feedback_id');

    console.log('Verification result:', verifyResult.recordset);

    if (verifyResult.recordset.length === 0) {
      throw new Error('Feedback was not inserted successfully');
    }

    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback_id: nextId
    });
  } catch (err) {
    console.error('❌ submitFeedback error:', err);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: err.message,
      stack: err.stack
    });
  }
}

module.exports = {
   getTasks,
  getProjects,
  getProjectDetails,
  getBudget,
  getComments,
  getAttachments,
  getTimeTracking,
  submitFeedback
};
