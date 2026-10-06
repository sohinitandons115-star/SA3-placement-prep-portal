import express from 'express';
import { body, validationResult } from 'express-validator';
import Company from '../models/Company.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.findByUserId(req.user._id);
    res.json(companies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/companies
// @desc    Add new company application
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('role', 'Role is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, role, status, appliedDate } = req.body;

    try {
      const company = await Company.create({
        name,
        role,
        status,
        appliedDate: appliedDate || new Date(),
        userId: req.user._id,
      });

      res.json(company);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { name, role, status, appliedDate } = req.body;

  const companyFields = {};
  if (name) companyFields.name = name;
  if (role) companyFields.role = role;
  if (status) companyFields.status = status;
  if (appliedDate) companyFields.appliedDate = appliedDate;

  try {
    let company = await Company.findById(req.params.id);

    if (!company) return res.status(404).json({ msg: 'Company not found' });

    // Make sure user owns company
    if (company.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    company = await Company.update(req.params.id, companyFields);

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) return res.status(404).json({ msg: 'Company not found' });

    // Make sure user owns company
    if (company.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Company.delete(req.params.id);

    res.json({ msg: 'Company removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
