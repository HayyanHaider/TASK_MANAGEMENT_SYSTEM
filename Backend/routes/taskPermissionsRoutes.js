// /backend/routes/taskPermissionsRoutes.js
const express = require('express');
const router = express.Router();
const taskPermissionsController = require('../controllers/taskPermissionsController');

// GET /api/task-permissions
router.get('/', taskPermissionsController.getAllTaskPermissions);

// GET /api/task-permissions/task/:task_id
router.get('/task/:task_id', taskPermissionsController.getTaskPermissionsByTaskId);

// POST /api/task-permissions
router.post('/', taskPermissionsController.createTaskPermission);

// DELETE /api/task-permissions
router.delete('/', taskPermissionsController.deleteTaskPermission);

module.exports = router; 