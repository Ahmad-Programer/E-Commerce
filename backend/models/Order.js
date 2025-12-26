// ============================================
// ORDER MODEL - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

// Order Item Sub-Schema
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: String,
    icon: String
});

// Shipping Address Sub-Schema
const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' }
});

// Main Order Schema
const orderSchema = new mongoose.Schema({
    // Order Reference
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    
    // Customer Info
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    
    // Order Items
    items: [orderItemSchema],
    
    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    discount: {
        code: String,
        amount: { type: Number, default: 0 }
    },
    total: {
        type: Number,
        required: true
    },
    
    // Addresses
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    
    // Payment
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'cod', 'bank_transfer'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        transactionId: String,
        paidAt: Date,
        method: String
    },
    
    // Order Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    
    // Shipping Info
    shippingMethod: {
        type: String,
        enum: ['standard', 'express', 'overnight', 'pickup'],
        default: 'standard'
    },
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    
    // Notes
    customerNote: String,
    adminNote: String,
    
    // Flags
    isGift: {
        type: Boolean,
        default: false
    },
    giftMessage: String
    
}, {
    timestamps: true
});

// ============================================
// INDEXES
// ============================================

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// ============================================
// MIDDLEWARE (Hooks)
// ============================================

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        // Generate unique order number: ORD-YYYYMMDD-XXXX
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ORD-${dateStr}-${random}`;
    }
    
    // Add status to history if changed
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
    }
    
    next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Update order status
orderSchema.methods.updateStatus = async function(newStatus, note = '', updatedBy = null) {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        note,
        updatedBy,
        timestamp: new Date()
    });
    
    // Update timestamps for specific statuses
    if (newStatus === 'delivered') {
        this.deliveredAt = new Date();
    }
    
    return this.save();
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    // Calculate total
    this.total = this.subtotal + this.tax + this.shippingCost - this.discount.amount;
    
    return this;
};

// Check if can be cancelled
orderSchema.methods.canBeCancelled = function() {
    const cancelableStatuses = ['pending', 'confirmed', 'processing'];
    return cancelableStatuses.includes(this.status);
};

// ============================================
// STATIC METHODS
// ============================================

// Get orders by user
orderSchema.statics.getByUser = function(userId, options = {}) {
    let query = this.find({ user: userId }).sort({ createdAt: -1 });
    
    if (options.limit) {
        query = query.limit(options.limit);
    }
    
    return query;
};

// Get orders by status
orderSchema.statics.getByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Get order statistics
orderSchema.statics.getStats = async function(startDate, endDate) {
    const match = {};
    
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }
    
    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                averageOrderValue: { $avg: '$total' },
                totalItems: { $sum: { $size: '$items' } }
            }
        }
    ]);
    
    return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalItems: 0
    };
};

// Get recent orders
orderSchema.statics.getRecent = function(limit = 10) {
    return this.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'firstName lastName email');
};

// Get orders count by status
orderSchema.statics.getCountByStatus = async function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

// Create and export the model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
