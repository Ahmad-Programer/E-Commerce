// ============================================
// AUTH ROUTES - User Authentication API
// ============================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);
    
    // Remove password from output
    user.password = undefined;
    
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        }
    });
};

// ============================================
// ROUTES
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        
        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }
        
        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone
        });
        
        console.log(`✅ New user registered: ${email}`);
        
        sendTokenResponse(user, 201, res);
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }
        
        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        
        console.log(`✅ User logged in: ${email}`);
        
        sendTokenResponse(user, 200, res);
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                address: user.address,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({
            success: false,
            error: 'Not authorized'
        });
    }
});

/**
 * @route   PUT /api/auth/updateprofile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/updateprofile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const fieldsToUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            address: req.body.address
        };
        
        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => 
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );
        
        const user = await User.findByIdAndUpdate(
            decoded.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
