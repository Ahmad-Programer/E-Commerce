// ============================================
// PRODUCT ROUTES - Products API
// ============================================

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Build query
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludeFields.forEach(el => delete queryObj[el]);
        
        // Base filter - only active products
        let query = { isActive: true };
        
        // Category filter
        if (queryObj.category) {
            query.category = queryObj.category;
        }
        
        // Price range filter
        if (queryObj.minPrice || queryObj.maxPrice) {
            query.price = {};
            if (queryObj.minPrice) query.price.$gte = Number(queryObj.minPrice);
            if (queryObj.maxPrice) query.price.$lte = Number(queryObj.maxPrice);
        }
        
        // In stock filter
        if (queryObj.inStock === 'true') {
            query.inStock = true;
        }
        
        // Brand filter
        if (queryObj.brand) {
            query.brand = { $regex: queryObj.brand, $options: 'i' };
        }
        
        // Search
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { brand: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Execute query
        let queryBuilder = Product.find(query);
        
        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            queryBuilder = queryBuilder.sort(sortBy);
        } else {
            queryBuilder = queryBuilder.sort('-createdAt');
        }
        
        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            queryBuilder = queryBuilder.select(fields);
        }
        
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;
        
        queryBuilder = queryBuilder.skip(skip).limit(limit);
        
        // Execute
        const products = await queryBuilder;
        const total = await Product.countDocuments(query);
        
        res.json({
            success: true,
            count: products.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            products
        });
        
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 8;
        const products = await Product.getFeatured(limit);
        
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured products'
        });
    }
});

/**
 * @route   GET /api/products/categories
 * @desc    Get all categories with product count
 * @access  Public
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('reviews.user', 'firstName lastName avatar');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
});

// ============================================
// ADMIN ROUTES (Add authentication middleware later)
// ============================================

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Admin
 */
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        
        console.log(`✅ New product created: ${product.name}`);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create product'
        });
    }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Admin
 */
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Admin
 */
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
});

/**
 * @route   POST /api/products/:id/review
 * @desc    Add review to product
 * @access  Private
 */
router.post('/:id/review', async (req, res) => {
    try {
        const { rating, comment, title, userId } = req.body;
        
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        
        await product.addReview(userId, rating, comment, title);
        
        res.json({
            success: true,
            message: 'Review added successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to add review'
        });
    }
});

module.exports = router;
