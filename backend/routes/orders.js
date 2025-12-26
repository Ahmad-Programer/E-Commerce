// ============================================
// ORDER ROUTES - Orders API
// ============================================

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// ============================================
// USER ROUTES
// ============================================

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            shippingMethod,
            customerNote,
            isGift,
            giftMessage,
            userId,
            customerEmail
        } = req.body;
        
        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No items in order'
            });
        }
        
        // Calculate totals
        let subtotal = 0;
        const orderItems = [];
        
        for (const item of items) {
            // Verify product exists and has stock
            const product = await Product.findById(item.productId);
            
            if (!product) {
                return res.status(400).json({
                    success: false,
                    error: `Product not found: ${item.productId}`
                });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient stock for: ${product.name}`
                });
            }
            
            // Add to order items
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.images[0]?.url || '',
                icon: product.icon
            });
            
            subtotal += product.price * item.quantity;
            
            // Reduce stock
            await product.reduceStock(item.quantity);
        }
        
        // Calculate shipping
        let shippingCost = 0;
        switch (shippingMethod) {
            case 'express':
                shippingCost = 9.99;
                break;
            case 'overnight':
                shippingCost = 19.99;
                break;
            case 'standard':
            default:
                shippingCost = subtotal >= 50 ? 0 : 5.99;
        }
        
        // Calculate tax (8% example)
        const tax = subtotal * 0.08;
        
        // Calculate total
        const total = subtotal + tax + shippingCost;
        
        // Create order
        const order = await Order.create({
            user: userId,
            customerEmail,
            items: orderItems,
            subtotal,
            tax,
            shippingCost,
            total,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            shippingMethod: shippingMethod || 'standard',
            customerNote,
            isGift,
            giftMessage,
            statusHistory: [{
                status: 'pending',
                note: 'Order placed'
            }]
        });
        
        console.log(`✅ New order created: ${order.orderNumber}`);
        
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status,
                estimatedDelivery: order.estimatedDelivery
            }
        });
        
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order'
        });
    }
});

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get current user's orders
 * @access  Private
 */
router.get('/my-orders', async (req, res) => {
    try {
        const userId = req.query.userId; // In production, get from JWT
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }
        
        const orders = await Order.getByUser(userId);
        
        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name images icon');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order'
        });
    }
});

/**
 * @route   GET /api/orders/track/:orderNumber
 * @desc    Track order by order number
 * @access  Public
 */
router.get('/track/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ 
            orderNumber: req.params.orderNumber 
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            tracking: {
                orderNumber: order.orderNumber,
                status: order.status,
                statusHistory: order.statusHistory,
                trackingNumber: order.trackingNumber,
                carrier: order.carrier,
                estimatedDelivery: order.estimatedDelivery,
                shippingAddress: {
                    city: order.shippingAddress.city,
                    state: order.shippingAddress.state
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to track order'
        });
    }
});

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        if (!order.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                error: 'Order cannot be cancelled at this stage'
            });
        }
        
        // Restore stock for cancelled items
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }
        
        await order.updateStatus('cancelled', req.body.reason || 'Cancelled by customer');
        
        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to cancel order'
        });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin)
 * @access  Admin
 */
router.get('/', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        let query = {};
        if (status) query.status = status;
        
        const orders = await Order.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Order.countDocuments(query);
        
        res.json({
            success: true,
            count: orders.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin)
 * @access  Admin
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { status, note, trackingNumber, carrier } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        // Update tracking info if provided
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (carrier) order.carrier = carrier;
        
        await order.updateStatus(status, note);
        
        res.json({
            success: true,
            message: 'Order status updated',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update order status'
        });
    }
});

/**
 * @route   GET /api/orders/stats/overview
 * @desc    Get order statistics (Admin)
 * @access  Admin
 */
router.get('/stats/overview', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const stats = await Order.getStats(startDate, endDate);
        const statusCounts = await Order.getCountByStatus();
        const recentOrders = await Order.getRecent(5);
        
        res.json({
            success: true,
            stats,
            statusCounts,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
