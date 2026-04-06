const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

router
  .route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

module.exports = router;
