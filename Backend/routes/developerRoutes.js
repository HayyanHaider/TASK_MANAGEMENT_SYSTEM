const express = require('express');
const router = express.Router();
const devCtrl = require('../controllers/developerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
// All developer endpoints require authentication + developer role (role_id 3)
router.use(authenticate, authorize([3]));

// fetch my tasks
router.get('/tasks', devCtrl.getAssignedTasks);

// subtasks for a task
router.get('/tasks/:taskId/subtasks', devCtrl.getSubtasks);
router.put('/subtasks/:subtaskId', devCtrl.updateSubtaskStatus);

// post a comment on a task
router.post('/tasks/:taskId/comments', devCtrl.addComment);

// upload an attachment (JSON stub)
router.get(
    '/tasks/:taskId/attachments',
    devCtrl.getAttachments
  );
  
  // POST stub upload
  router.post(
    '/tasks/:taskId/attachments',
    devCtrl.addAttachment
  );

  router.delete(
    '/tasks/:taskId/attachments/:attachmentId',
    devCtrl.deleteAttachment
  );

// time‑tracking endpoints
router.get    ('/tasks/:taskId/time',      devCtrl.getTimeEntries)      // fetch entries
router.post   ('/tasks/:taskId/time',      devCtrl.trackTime)           // start/stop
router.delete ('/tasks/:taskId/time',      devCtrl.clearTimeEntries)    // clear all


// update status of task
router.put('/tasks/:taskId/status', devCtrl.updateTaskStatus);



module.exports = router;
