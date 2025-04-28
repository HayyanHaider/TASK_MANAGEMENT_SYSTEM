// /backend/routes/projectStatusRoutes.js
const express = require('express');
const router = express.Router();
const projectStatusController = require('../controllers/projectStatusController');

// GET /api/project-status
router.get('/', projectStatusController.getAllProjectStatuses);

// GET /api/project-status/:id
router.get('/:id', projectStatusController.getProjectStatusById);

// POST /api/project-status
router.post('/', projectStatusController.createProjectStatus);

// PUT /api/project-status/:id
router.put('/:id', projectStatusController.updateProjectStatus);

// DELETE /api/project-status/:id
router.delete('/:id', projectStatusController.deleteProjectStatus);

module.exports = router; 