// ============================================
// PRODUCT MODEL - MongoDB Schema
// ============================================

const mongoose = require('mongoose');

// Product Schema Definition
const productSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: 300
    },
    
    // Pricing
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    discount: {
        percentage: { type: Number, default: 0, min: 0, max: 100 },
        validUntil: Date
    },
    
    // Categorization
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['electronics', 'fashion', 'home', 'sports', 'books', 'beauty', 'toys', 'grocery', 'other']
    },
    subCategory: String,
    brand: {
        type: String,
        trim: true
    },
    tags: [String],
    
    // Inventory
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    
    // Media
    images: [{
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false }
    }],
    icon: {
        type: String,
        default: 'fas fa-box'
    },
    
    // Features & Specifications
    features: [String],
    specifications: [{
        name: String,
        value: String
    }],
    
    // Reviews & Ratings
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: String,
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    // SEO
    metaTitle: String,
    metaDescription: String,
    
    // Seller/Admin Info
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Calculate sale price
productSchema.virtual('salePrice').get(function() {
    if (this.discount && this.discount.percentage > 0) {
        const discountAmount = (this.price * this.discount.percentage) / 100;
        return (this.price - discountAmount).toFixed(2);
    }
    return this.price;
});

// Check if on sale
productSchema.virtual('isOnSale').get(function() {
    return this.discount && this.discount.percentage > 0;
});

// ============================================
// MIDDLEWARE (Hooks)
// ============================================

// Generate slug before saving
productSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Update inStock based on stock quantity
    this.inStock = this.stock > 0;
    
    next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Add review
productSchema.methods.addReview = async function(userId, rating, comment, title = '') {
    this.reviews.push({
        user: userId,
        rating,
        comment,
        title
    });
    
    // Recalculate average rating
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = (totalRating / this.reviews.length).toFixed(1);
    this.rating.count = this.reviews.length;
    
    return this.save();
};

// Reduce stock
productSchema.methods.reduceStock = async function(quantity) {
    if (this.stock < quantity) {
        throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
    this.inStock = this.stock > 0;
    return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get products by category
productSchema.statics.getByCategory = function(category) {
    return this.find({ category, isActive: true });
};

// Get featured products
productSchema.statics.getFeatured = function(limit = 8) {
    return this.find({ isFeatured: true, isActive: true }).limit(limit);
};

// Search products
productSchema.statics.search = function(query, options = {}) {
    const searchQuery = {
        isActive: true,
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { brand: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    };
    
    let queryBuilder = this.find(searchQuery);
    
    if (options.category) {
        queryBuilder = queryBuilder.where('category').equals(options.category);
    }
    
    if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
    }
    
    if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
    }
    
    return queryBuilder;
};

// Get low stock products
productSchema.statics.getLowStock = function() {
    return this.find({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        isActive: true
    });
};

// Create and export the model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
