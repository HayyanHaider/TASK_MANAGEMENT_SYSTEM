// /backend/routes/clientRoutes.js
const express = require('express');
const router  = express.Router();
const client  = require('../controllers/clientController');
const auth    = require('../middleware/authMiddleware'); // your existing auth

// All client endpoints require a valid token
router.use(auth.authenticate); 


router.get(
    '/projects/:projectId/tasks',
    client.getTasks
  );

// List all projects visible to this client
router.get(
  '/projects',
  client.getProjects
);

// Get full details for one project
router.get(
  '/projects/:projectId/details',
  client.getProjectDetails
);

// Get budget info
router.get(
  '/projects/:projectId/budget',
  client.getBudget
);

// View all comments on that project
router.get(
  '/projects/:projectId/comments',
  client.getComments
);

// View all attachments for that project
router.get(
  '/projects/:projectId/attachments',
  client.getAttachments
);

// View time‑tracking for that project
router.get(
  '/projects/:projectId/timetracking',
  client.getTimeTracking
);

// Submit feedback (for project or specific task)
router.post(
  '/feedback',
  client.submitFeedback
);

module.exports = router;
