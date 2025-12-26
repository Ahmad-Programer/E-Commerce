// ============================================
// USER MODEL - MongoDB Schema
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema Definition
const userSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    
    // Profile Information
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    
    // Address Information
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'USA' }
    },
    
    // Account Settings
    role: {
        type: String,
        enum: ['customer', 'admin', 'moderator'],
        default: 'customer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    
    // Shopping Data
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    
    // Timestamps
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
    
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// ============================================
// MIDDLEWARE (Hooks)
// ============================================

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash if password was modified
    if (!this.isModified('password')) return next();
    
    // Hash password with salt rounds of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// ============================================
// STATIC METHODS
// ============================================

// Find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Get admin users
userSchema.statics.getAdmins = function() {
    return this.find({ role: 'admin' });
};

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;
