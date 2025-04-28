// /backend/routes/projectRoutes.js
const express = require('express');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Anyone authenticated can view projects
router.get('/',       authenticate, getAllProjects);
router.get('/:id',    authenticate, getProjectById);

// Only Admin (role 1) and Project Manager (role 2) can create/update/delete
router.post('/',      authenticate, authorize([1,2]), createProject);
router.put('/:id',    authenticate, authorize([1,2]), updateProject);
router.delete('/:id', authenticate, authorize([1,2]), deleteProject);

module.exports = router;
