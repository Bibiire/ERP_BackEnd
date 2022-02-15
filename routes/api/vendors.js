const express = require('express');
const router = express.Router();
const Vendor = require('../../models/Vendors');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @Route   Get api/department
// @desc    Get all Vendor
// @Access  Private
router.get('/', auth, async (req, res) => {
  try {
    let queryParams = {};
    if (req.query) {
      queryParams = req.query;
    }
    const vendors = await Vendor.find(queryParams).sort({ created_at: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).send('server down');
  }
});

// @Route   Post api/department
// @desc    Create new Vendor
// @Access  Private
router.post(
  '/',
  [
    check('name', 'Vendor name is required').not().isEmpty(),
    check('location', "Vendor's location is required").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, location, bank_details, phone_no } = req.body;
    try {
      const vendor = new Vendor({
        name,
        location,
        phone_no,
        bank_details,
      });

      let result = await vendor.save();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).send('server down');
    }
  }
);

// @Route   Post api/department
// @desc    Update Vendor
// @Access  Private
router.put(
  '/:id',
  [
    check('name', 'Vendor name is required').not().isEmpty(),
    check('location', "Vendor's location is required").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const vendorId = req.params.id;
    const { name, location, bank_details, status } = req.body;
    let result = Vendor.findById(vendorId);

    if (!result) return res.send({ error: 'vendor not found' });

    try {
      const updateObj = {
        name,
        location,
        bank_details,
        status,
      };

      const vendorUpdate = await Vendor.findByIdAndUpdate(vendorId, updateObj, {
        new: true,
      });

      res.json(vendorUpdate);
    } catch (error) {
      res.status(500).send('server down');
    }
  }
);

module.exports = router;
