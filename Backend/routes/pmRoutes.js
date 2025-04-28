// /backend/routes/pmRoutes.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');      // if you use it
const {
  getProjectsByManager,
  getProjectById,
  getFullProjectDetails,   // ← the new function you just added
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
  deleteSubtask
} = require('../controllers/pmController');

const router = express.Router();

// — Project Manager routes —
router.get   ('/projects',                     authenticate, getProjectsByManager);
router.post  ('/projects',                     authenticate, createProject);
router.get   ('/projects/:projectId',          authenticate, getProjectById);
router.put   ('/projects/:projectId',          authenticate, updateProject);
router.delete('/projects/:projectId',          authenticate, deleteProject);

// — Details endpoint: project + tasks + subtasks —
router.get   ('/projects/:projectId/details',  authenticate, getFullProjectDetails);

// — Task routes —
router.get   ('/projects/:projectId/tasks',    authenticate, getTasksByProject);
router.post  ('/projects/:projectId/tasks',    authenticate, createTask);
router.put   ('/tasks/:taskId',                authenticate, updateTask);
router.delete('/tasks/:taskId',                authenticate, deleteTask);

// — Subtask routes —
router.get   ('/tasks/:taskId/subtasks',       authenticate, getSubtasksByTask);
router.post  ('/tasks/:taskId/subtasks',       authenticate, createSubtask);
router.put   ('/subtasks/:subtaskId',          authenticate, updateSubtask);
router.delete('/subtasks/:subtaskId',          authenticate, deleteSubtask);

module.exports = router;
