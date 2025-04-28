// /backend/routes/roleRoutes.js
const express = require('express');
const {
  getAllRoles,
  createRole,
  deleteRole
} = require('../controllers/roleController');

const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// only Admin (role_id=1) can manage roles
router.get('/',       authenticate, authorize([1]), getAllRoles);
router.post('/',      authenticate, authorize([1]), createRole);
router.delete('/:id', authenticate, authorize([1]), deleteRole);

module.exports = router;
