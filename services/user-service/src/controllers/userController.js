const UserProfile = require('../models/User');
const { verifyToken } = require('../utils/apiClient');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const userProfile = await UserProfile.findOne({ 
      authId: req.user.id 
    }).populate('authId', 'name email');

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: userProfile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    
    // Validate addresses if provided
    if (updates.addresses) {
      updates.addresses = updates.addresses.map(addr => ({
        ...addr,
        isDefault: addr.isDefault || false
      }));
      
      // Ensure only one default address
      const hasDefault = updates.addresses.some(addr => addr.isDefault);
      if (hasDefault) {
        updates.addresses = updates.addresses.map(addr => ({
          ...addr,
          isDefault: addr.isDefault
        }));
      }
    }

    let userProfile = await UserProfile.findOneAndUpdate(
      { authId: req.user.id },
      { $set: updates },
      { 
        new: true,
        runValidators: true 
      }
    );

    // Create profile if doesn't exist
    if (!userProfile) {
      userProfile = await UserProfile.create({
        authId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        ...updates
      });
    }

    res.status(200).json({
      success: true,
      profile: userProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
