/**
 * Authentication Middleware & Utilities
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { collections, generateId } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

/**
 * Hash password with bcrypt
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
function generateToken(userId) {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Express middleware: Verify JWT from Authorization header
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
}

/**
 * Register new user
 */
async function registerUser(username, email, password) {
  try {
    const usersCollection = collections.users();

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return {
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = generateId();
    const now = new Date();

    await usersCollection.insertOne({
      _id: userId,
      username,
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    });

    const token = generateToken(userId);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        userId,
        username,
        email,
        token
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed: ' + error.message
    };
  }
}

/**
 * Login user
 */
async function loginUser(email, password) {
  try {
    const usersCollection = collections.users();

    // Find user
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid password'
      };
    }

    const token = generateToken(user._id);

    return {
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        token
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Login failed: ' + error.message
    };
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authMiddleware,
  registerUser,
  loginUser,
  JWT_SECRET,
  JWT_EXPIRY
};
