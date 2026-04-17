/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * POST /auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username, email, and password are required'
      });
    }

    const result = await auth.registerUser(username, email, password);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(201).json({
      status: 'success',
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const result = await auth.loginUser(email, password);

    if (!result.success) {
      return res.status(401).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
});

/**
 * POST /auth/verify
 * Verify JWT token
 */
router.post('/verify', auth.authMiddleware, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
    userId: req.userId
  });
});

module.exports = router;
