const express = require('express');
const router = express.Router();
const Department = require('../../models/DepartmentModel');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @Route   Get api/department
// @desc    Get all departments
// @Access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).send('server down');
  }
});

// @Route   Post api/department
// @desc    Create new Department
// @Access  Private
router.post('/', auth, async (req, res) => {
  const { department } = req.body;
  const cloneDepartment = department.toLowerCase().trim()
  try {
    let departmentName = await Department.findOne({ name: cloneDepartment });
    if (departmentName) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Department already exist' }] });
    }
    departmentName = new Department({
      name: cloneDepartment,
    });

    departmentName.save();
    res.status(201).json({ msg: 'item save successfully' });
  } catch (error) {
    res.status(500).send('server down');
  }
});

module.exports = router;
