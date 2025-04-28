// /backend/routes/dashboardRoutes.js
const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const dc = require('../controllers/dashboardController');

// Protect every dashboard route with your auth middleware
router.get('/admin',           authMiddleware, dc.adminDashboard);
router.get('/project-manager', authMiddleware, dc.projectManagerDashboard);
router.get('/developer',       authMiddleware, dc.developerDashboard);
router.get('/tester',          authMiddleware, dc.testerDashboard);
router.get('/client',          authMiddleware, dc.clientDashboard);

module.exports = router;
