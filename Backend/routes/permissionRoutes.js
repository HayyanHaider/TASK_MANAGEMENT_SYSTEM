// /backend/routes/permissionRoutes.js
const express = require('express');
const {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission
} = require('../controllers/permissionController');

const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// only Admin manages permissions
router.get('/',       authenticate, authorize([1]), getAllPermissions);
router.post('/',      authenticate, authorize([1]), createPermission);
router.put('/:id',    authenticate, authorize([1]), updatePermission);
router.delete('/:id', authenticate, authorize([1]), deletePermission);

module.exports = router;
