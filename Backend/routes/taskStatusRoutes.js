// /backend/routes/taskStatusRoutes.js
const express = require('express');
const router = express.Router();
const taskStatusController = require('../controllers/taskStatusController');

// GET /api/task-status
router.get('/', taskStatusController.getAllTaskStatuses);

// POST /api/task-status
router.post('/', taskStatusController.createTaskStatus);

// DELETE /api/task-status/:status_name
router.delete('/:status_name', taskStatusController.deleteTaskStatus);

module.exports = router; 