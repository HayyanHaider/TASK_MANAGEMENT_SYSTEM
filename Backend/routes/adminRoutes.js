// /backend/routes/adminRoutes.js
const express = require('express');
const router  = express.Router();
const admin   = require('../controllers/adminController');

// — User management —
router.get  ('/users',              admin.getUsers);
router.post ('/users',              admin.addUser);

// — Project management —
router.get    ('/projects',               admin.getProjects);
router.get    ('/projects/:projectId',    admin.getProject);
router.put    ('/projects/:projectId',    admin.updateProject);
router.delete ('/projects/:projectId',    admin.deleteProject);

// — Details endpoint —
router.get    ('/projects/:projectId/details', admin.getProjectDetails);

// — Task management —
router.get ('/tasks',                   admin.listTasks);
router.put ('/tasks/:taskId/assign',    admin.assignTask);

module.exports = router;
