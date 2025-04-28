// /backend/controllers/developerController.js
const { poolPromise, sql } = require('../db/sqlConnection');
const path = require("path");

// 1) GET /developer/tasks
//    List all tasks assigned to the logged‑in developer
async function getAssignedTasks(req, res) {
  const devId = req.user.user_id;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('devId', sql.Int, devId)
      .query(`
        SELECT 
          t.task_id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.created_at
        FROM Tasks t
        WHERE t.assigned_to = @devId
        ORDER BY t.task_id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching assigned tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// 2) GET /developer/tasks/:taskId/subtasks
async function getSubtasks(req, res) {
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
    console.error('Error fetching subtasks:', err);
    res.status(500).json({ error: 'Failed to fetch subtasks' });
  }
}

// 3) POST /developer/tasks/:taskId/comments
async function addComment(req, res) {
  const devId = req.user.user_id;
  const { taskId } = req.params;
  const { comment } = req.body;
  if (!comment?.trim()) return res.status(400).json({ error: 'Comment text required' });
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('taskId', sql.Int, taskId)
      .input('userId', sql.Int, devId)
      .input('comment', sql.Text, comment)
      .query(`
        INSERT INTO Comments (comment_id, task_id, user_id, comment, created_at)
        VALUES (
          (SELECT ISNULL(MAX(comment_id),0)+1 FROM Comments),
          @taskId, @userId, @comment, GETDATE()
        )
      `);
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}


async function trackTime(req, res) {
  const devId = req.user.user_id;
  const { taskId } = req.params;
  const { action } = req.body;

  if (!taskId || isNaN(taskId)) {
    console.error('Invalid taskId:', taskId);
    return res.status(400).json({ error: 'Invalid taskId parameter' });
  }

  try {
    const pool = await poolPromise;

    if (action === 'start') {
      const checkRunning = await pool.request()
        .input('taskId', sql.Int, taskId)
        .input('userId', sql.Int, devId)
        .query(`
          SELECT time_entry_id
          FROM TimeTracking
          WHERE task_id = @taskId AND user_id = @userId AND end_time IS NULL
        `);

      if (checkRunning.recordset.length > 0) {
        return res.status(400).json({ error: 'Timer is already running' });
      }

      await pool.request()
        .input('taskId', sql.Int, taskId)
        .input('userId', sql.Int, devId)
        .query(`
          INSERT INTO TimeTracking (time_entry_id, task_id, user_id, start_time)
          VALUES ((SELECT ISNULL(MAX(time_entry_id), 0) + 1 FROM TimeTracking), @taskId, @userId, SYSDATETIMEOFFSET())
        `);

      return res.status(201).json({ message: 'Timer started' });
    } else if (action === 'stop') {
      const runningEntry = await pool.request()
        .input('taskId', sql.Int, taskId)
        .input('userId', sql.Int, devId)
        .query(`
          SELECT TOP 1 time_entry_id
          FROM TimeTracking
          WHERE task_id = @taskId AND user_id = @userId AND end_time IS NULL
          ORDER BY start_time DESC
        `);

      if (!runningEntry.recordset.length) {
        return res.status(400).json({ error: 'No running timer to stop' });
      }

      const entryId = runningEntry.recordset[0].time_entry_id;

      await pool.request()
        .input('entryId', sql.Int, entryId)
        .query(`
          UPDATE TimeTracking
          SET end_time = SYSDATETIMEOFFSET()
          WHERE time_entry_id = @entryId
        `);

      return res.status(200).json({ message: 'Timer stopped' });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('Error tracking time:', err);
    res.status(500).json({ error: 'Failed to track time' });
  }
}




// 6) PUT /developer/subtasks/:subtaskId
//    Developer updates status of a subtask
async function updateSubtaskStatus(req, res) {
  const { subtaskId } = req.params;
  const { status } = req.body;

  if (!['To Do', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('subtaskId', sql.Int, subtaskId)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Subtasks
        SET status = @status
        WHERE subtask_id = @subtaskId
      `);
    res.json({ message: 'Subtask status updated' });
  } catch (err) {
    console.error('Error updating subtask status:', err);
    res.status(500).json({ error: 'Failed to update subtask status' });
  }
}


async function getTimeEntries(req, res) {
  const devId = req.user.user_id;
  const { taskId } = req.params;
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid taskId' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('taskId', sql.Int, taskId)
      .input('userId', sql.Int, devId)
      .query(`
        SELECT
          time_entry_id,
          start_time,
          end_time,
          DATEDIFF(MINUTE, start_time, ISNULL(end_time, GETDATE())) as total_time
        FROM TimeTracking
        WHERE task_id = @taskId
          AND user_id = @userId
        ORDER BY start_time DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching time entries:', err);
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
}

// ―――― New: DELETE all time entries for a task (clear) ――――
async function clearTimeEntries(req, res) {
  const devId = req.user.user_id;
  const { taskId } = req.params;
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid taskId' });
  }
  try {
    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);
    await tx.begin();
    const rq = tx.request()
      .input('taskId', sql.Int, taskId)
      .input('userId', sql.Int, devId);

    await rq.query(`
      DELETE FROM TimeTracking
      WHERE task_id = @taskId AND user_id = @userId;
    `);

    await tx.commit();
    res.json({ message: 'All time entries cleared' });
  } catch (err) {
    console.error('Error clearing time entries:', err);
    res.status(500).json({ error: 'Failed to clear time entries' });
  }
}

async function getAttachments(req, res) {
  const devId  = req.user.user_id;         // optional: you could verify dev owns task
  const { taskId } = req.params;
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid taskId' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('taskId', sql.Int, taskId)
      .query(`
        SELECT
          attachment_id,
          attachment_name,
          attachment_type,
          file_path,
          uploaded_at
        FROM Attachments
        WHERE task_id = @taskId
        ORDER BY uploaded_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching attachments:', err);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
}

// … existing requires, etc.
async function deleteAttachment(req, res) {
  const { taskId, attachmentId } = req.params;

  // Basic validation
  if (!Number.isInteger(+taskId) || !Number.isInteger(+attachmentId)) {
    return res.status(400).json({ error: 'Invalid taskId or attachmentId' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('taskId',       sql.Int, taskId)
      .input('attachmentId', sql.Int, attachmentId)
      .query(`
        DELETE FROM Attachments
        WHERE attachment_id = @attachmentId
          AND task_id       = @taskId
      `);

    // rowsAffected[0] is the number of rows deleted
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Attachment not found for that task' });
    }

    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    console.error('Error deleting attachment:', err);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
}


async function addAttachment(req, res) {
  const { taskId } = req.params;
  let { attachment_name, attachment_type, file_path } = req.body;

  if (!file_path) {
    return res.status(400).json({ error: 'file_path required' });
  }

  // If attachment_type missing, try to get it from file_path or name
  if (!attachment_type && (file_path || attachment_name)) {
    const source = file_path || attachment_name;
    attachment_type = path.extname(source).slice(1).toLowerCase(); // e.g., 'pdf', 'sql'
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('taskId', sql.Int, taskId)
      .input('attachment_name', sql.NVarChar, attachment_name || null)
      .input('attachment_type', sql.NVarChar, attachment_type || null)
      .input('file_path', sql.NVarChar, file_path)
      .query(`
        INSERT INTO Attachments (
          attachment_id, task_id, attachment_name, attachment_type, file_path, uploaded_at
        )
        VALUES (
          (SELECT ISNULL(MAX(attachment_id), 0) + 1 FROM Attachments),
          @taskId, @attachment_name, @attachment_type, @file_path, GETDATE()
        )
      `);

    res.status(201).json({ message: 'Attachment added' });
  } catch (err) {
    console.error('Error adding attachment:', err);
    res.status(500).json({ error: 'Failed to add attachment' });
  }
}


async function updateTaskStatus(req, res) {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const pool = await poolPromise;

    // If trying to set task to Completed, check if all subtasks are completed
    if (status === 'Completed') {
      const result = await pool.request()
        .input('taskId', sql.Int, taskId)
        .query(`
          SELECT COUNT(*) AS incompleteCount
          FROM Subtasks
          WHERE task_id = @taskId AND status != 'Completed'
        `);

      const { incompleteCount } = result.recordset[0];
      if (incompleteCount > 0) {
        return res.status(400).json({ error: 'Cannot mark task as Completed until all subtasks are Completed.' });
      }
    }

    // Update the task status
    await pool.request()
      .input('taskId', sql.Int, taskId)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Tasks SET status = @status WHERE task_id = @taskId
      `);

    res.json({ message: 'Task status updated successfully' });

  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
}


module.exports = {
  getAssignedTasks,
  getSubtasks,
  addComment,
  addAttachment,
  trackTime,
  updateSubtaskStatus,
  clearTimeEntries,
  getTimeEntries,
  getAttachments,
  deleteAttachment ,
  updateTaskStatus    
};
