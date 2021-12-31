const express = require('express');
const router = express.Router();
const Vendor = require('../../models/Vendors');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @Route   Get api/department
// @desc    Get all departments
// @Access  Private
router.get('/', auth, async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    res.status(500).send('server down');
  }
});

// @Route   Post api/department
// @desc    Create new Department
// @Access  Private
router.post('/', auth, async (req, res) => {
  const { name, location } = req.body;
  try {
    const vendor = new Vendor({
      name,
      location,
    });

    vendor.save();
    res.status(201).json({ msg: 'item save successfully' });
  } catch (error) {
    res.status(500).send('server down');
  }
});

module.exports = router;
