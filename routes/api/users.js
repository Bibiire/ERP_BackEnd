const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/UserModel');
const Profile = require('../../models/ProfileModel');
const Department = require('../../models/DepartmentModel');

// @Route   Get api/users/user
// @desc    fetch user
// @Access  Private

router.get('/user', auth, async (req, res) => {
  try {
    const users = await User.findById(req.user.id).select('-password');
    res.json(users);
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server Down');
  }
});

// @Route   Get api/users
// @desc    fetch all user
// @Access  Private

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server Down');
  }
});

// @Route   Post api/users
// @desc    Create new user
// @Access  Public

router.post(
  '/',
  [
    check('name', 'Name is required ').not().isEmpty(),
    check('departmentId', 'Department is required ').not().isEmpty(),
    check('roles', 'Role is required ').not().isEmpty(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    check('email', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, departmentId, roles } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exist' }] });
      }
      user = new User({
        name: name.toLowerCase().trim(),
        email,
        password,
        departmentId,
        roles,
      });
      // convert roles to an arrays
      user.roles = roles.split(',').map((role) => role.trim());
      //  find department and merge it id if found
      const departmentName = await Department.findById(departmentId);
      if (!departmentName) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Department does not exist' }] });
      }

      user.departmentId = departmentName._id;
      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      const payload = {
        user: {
          id: user.id,
          role: user.roles[0],
        },
      };

      await user.save();

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      // return json web token
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Down');
    }
  }
);

// @Route   Get api/user/profile
// @desc    Fetch my  Profile
// @Access  Private

router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await Profile.find({
      user: req.user.id,
    }).populate('user', ['name', 'email', 'roles', 'departmentId']);
    if (!profile) {
      return res.status(400).send('No profile found for this user');
    }
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send('server down');
  }
});

// @Route   Post api/auth/profile
// @desc    For create And Post Route
// @Access  Private
router.post(
  '/profile',
  auth,
  [check('dob', 'Date of birth is required').not().isEmpty()],
  async (req, res) => {
    // check for Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dob, status, imgUrl } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (dob) profileFields.dob = dob;
    if (status) profileFields.status = status;
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //update profile
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create A profile
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Down');
    }
  }
);

module.exports = router;
