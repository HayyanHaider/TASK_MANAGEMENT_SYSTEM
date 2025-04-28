// /backend/routes/userRoutes.js
const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// only authenticated users can list/view; only Admin (role_id=1) can create/update/delete
router.get('/',       authenticate, getAllUsers);
router.get('/:id',    authenticate, getUserById);
router.post('/',      authenticate, authorize([1]), createUser);
router.put('/:id',    authenticate, authorize([1]), updateUser);
router.delete('/:id', authenticate, authorize([1]), deleteUser);

module.exports = router;
