// ============================================
// ADMIN ROUTES - Dashboard & Analytics API
// ============================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ============================================
// DASHBOARD OVERVIEW
// ============================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard overview data
 * @access  Admin
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Get date ranges
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        
        // Total counts
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        
        // Revenue calculations
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    avgOrderValue: { $avg: '$total' }
                }
            }
        ]);
        
        // Monthly revenue
        const monthlyRevenue = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: startOfMonth },
                    paymentStatus: 'completed'
                } 
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            }
        ]);
        
        // Today's orders
        const todaysOrders = await Order.countDocuments({
            createdAt: { $gte: startOfToday }
        });
        
        // Pending orders
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        
        // Low stock products
        const lowStockProducts = await Product.getLowStock();
        
        // Recent orders
        const recentOrders = await Order.getRecent(10);
        
        // New users this month
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        
        res.json({
            success: true,
            dashboard: {
                overview: {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalRevenue: revenueData[0]?.totalRevenue || 0,
                    avgOrderValue: revenueData[0]?.avgOrderValue || 0
                },
                today: {
                    orders: todaysOrders,
                    pendingOrders
                },
                monthly: {
                    revenue: monthlyRevenue[0]?.revenue || 0,
                    orders: monthlyRevenue[0]?.orders || 0,
                    newUsers: newUsersThisMonth
                },
                alerts: {
                    lowStockCount: lowStockProducts.length,
                    lowStockProducts: lowStockProducts.slice(0, 5)
                },
                recentOrders
            }
        });
        
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
});

/**
 * @route   GET /api/admin/analytics/sales
 * @desc    Get sales analytics
 * @access  Admin
 */
router.get('/analytics/sales', async (req, res) => {
    try {
        const { period = '7days' } = req.query;
        
        let startDate;
        const endDate = new Date();
        
        switch (period) {
            case '30days':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90days':
                startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(new Date().getFullYear(), 0, 1);
                break;
            case '7days':
            default:
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }
        
        // Daily sales data
        const dailySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    paymentStatus: 'completed'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Category sales
        const categorySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);
        
        res.json({
            success: true,
            period,
            analytics: {
                dailySales,
                categorySales
            }
        });
        
    } catch (error) {
        console.error('Sales analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sales analytics'
        });
    }
});

/**
 * @route   GET /api/admin/analytics/products
 * @desc    Get product analytics
 * @access  Admin
 */
router.get('/analytics/products', async (req, res) => {
    try {
        // Top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);
        
        // Products by category
        const productsByCategory = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    totalStock: { $sum: '$stock' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        // Low stock alert
        const lowStock = await Product.find({
            $expr: { $lte: ['$stock', '$lowStockThreshold'] },
            isActive: true
        }).select('name stock lowStockThreshold category');
        
        // Out of stock
        const outOfStock = await Product.find({
            stock: 0,
            isActive: true
        }).select('name category');
        
        res.json({
            success: true,
            analytics: {
                topProducts,
                productsByCategory,
                inventory: {
                    lowStock,
                    outOfStock,
                    lowStockCount: lowStock.length,
                    outOfStockCount: outOfStock.length
                }
            }
        });
        
    } catch (error) {
        console.error('Product analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product analytics'
        });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        
        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            count: users.length,
            total,
            pages: Math.ceil(total / limit),
            users
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Admin
 */
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['customer', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'User role updated',
            user
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update user role'
        });
    }
});

module.exports = router;
