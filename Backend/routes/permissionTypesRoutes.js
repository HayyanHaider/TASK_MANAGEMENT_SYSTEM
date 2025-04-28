// /backend/routes/permissionTypesRoutes.js
const express = require('express');
const router = express.Router();
const permissionTypesController = require('../controllers/permissionTypesController');

// GET /api/permission-types
router.get('/', permissionTypesController.getAllPermissionTypes);

// POST /api/permission-types
router.post('/', permissionTypesController.createPermissionType);

// DELETE /api/permission-types/:permission_type
router.delete('/:permission_type', permissionTypesController.deletePermissionType);

module.exports = router; 