// ============================================
// ROUTES INDEX - Export All Route Modules
// ============================================

const authRoutes = require('./auth');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const adminRoutes = require('./admin');

module.exports = {
    authRoutes,
    productRoutes,
    orderRoutes,
    adminRoutes
};
