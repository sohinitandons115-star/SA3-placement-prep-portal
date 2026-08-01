import express from 'express';
import { body, validationResult } from 'express-validator';
import Resource from '../models/Resource.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public or Private (Let's make it private for consistency with dashboard)
router.get('/', protect, async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/resources
// @desc    Add new resource
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('link', 'Link is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, category, link } = req.body;

    try {
      const newResource = new Resource({
        title,
        category,
        link,
      });

      const resource = await newResource.save();
      res.json(resource);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) return res.status(404).json({ msg: 'Resource not found' });

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Resource removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
