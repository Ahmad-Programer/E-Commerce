// ============================================
// E-COMMERCE WEBSITE - MAIN SERVER FILE
// ============================================

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Create Express application
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
    origin: 'http://localhost:3000', // We'll change this later
    credentials: true
}));

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend'), {
    index: false, // Don't serve index.html for directories
    extensions: ['html', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico']
}));

// Serve specific files from root
app.use('/style.css', express.static(path.join(__dirname, '../frontend/style.css')));
app.use('/script.js', express.static(path.join(__dirname, '../frontend/script.js')));
app.use('/js/:file', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/js', req.params.file));
});

// ============================================
// DATABASE CONNECTION
// ============================================

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully!');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit if database connection fails
});

// ============================================
// ROUTES
// ============================================

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

// Register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
});

// Products page
app.get('/products', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/pages/products.html'));
    } catch (error) {
        console.error('Error serving products page:', error);
        res.status(500).send('Error loading products page');
    }
});

// Cart page
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/cart.html'));
});

// Test cart debug page
app.get('/test-cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/test-cart.html'));
});

// Checkout page
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/checkout.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

// Admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/admin.html'));
});

// Track order page
app.get('/track-order', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/track-order.html'));
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV
    });
});

// Test API route
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        success: true,
        data: {
            service: 'E-Commerce Backend',
            version: '1.0.0',
            features: ['Authentication', 'Products', 'Orders', 'Admin Panel']
        }
    });
});

// ============================================
// API ROUTES
// ============================================

// Import route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// General error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    ============================================
    🛒 E-COMMERCE WEBSITE BACKEND
    ============================================
    📡 Server running on: http://localhost:${PORT}
    🌍 Environment: ${process.env.NODE_ENV}
    🗄️  Database: ${process.env.MONGODB_URI}
    ============================================
    `);
    
    console.log('\n📋 Available Routes:');
    console.log('   • GET  /              - Server status page');
    console.log('   • GET  /api/health    - Health check');
    console.log('   • GET  /api/test      - Test API endpoint');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('\n🔴 Server stopped gracefully');
    process.exit(0);
});