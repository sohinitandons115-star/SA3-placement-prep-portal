import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile metrics
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { codingBelts, communicationScore, attendance, vivaScore } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const updatedUser = await User.updateProfile(req.user._id, {
        codingBelts,
        communicationScore,
        attendance,
        vivaScore,
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        codingBelts: updatedUser.codingBelts,
        communicationScore: updatedUser.communicationScore,
        attendance: updatedUser.attendance,
        vivaScore: updatedUser.vivaScore,
      });
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile metrics
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
