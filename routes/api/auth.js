const express = require('express');
const router = express.Router();
const User = require('../../models/UserModel');
const auth = require('../../middleware/auth');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @Route   Get api/auth
// @desc    Test Route
// @Access  Private

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.send(user);
  } catch (error) {
    res.status(500).send('server down');
  }
  res.send('User Route');
});

// @Route   Post api/auth   - Login
// @desc    Authenticate User and get token
// @Access  Public

router.post(
  '/',
  [
    check('name', 'Name is required ').not().isEmpty(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password } = req.body;

    try {
      let user = await User.findOne({ name: name.toLowerCase().trim() });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      // compare Password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      const payload = {
        user: {
          id: user.id,
          role: user.roles[0],
          departmentId : user.departmentId
        },
      };

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

module.exports = router;
