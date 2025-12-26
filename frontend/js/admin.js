// ============================================
// ADMIN MODULE - Dashboard Functionality
// ============================================

// API Base URL
const API_BASE = '/api';

// Store state
let adminState = {
    currentSection: 'dashboard',
    products: [],
    orders: [],
    users: [],
    analytics: null
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Admin module initialized');
    
    // Setup navigation
    setupNavigation();
    
    // Load initial data
    loadDashboardData();
    
    // Update cart count
    updateCartCount();
    
    // Setup refresh interval (every 5 minutes)
    setInterval(refreshDashboard, 5 * 60 * 1000);
});

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            switchSection(sectionId);
        });
    });
}

function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update menu active state
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Load section-specific data
    adminState.currentSection = sectionId;
    loadSectionData(sectionId);
}

function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboardData() {
    try {
        // Try to fetch from API first
        const response = await fetch(`${API_BASE}/admin/dashboard`);
        
        if (response.ok) {
            const data = await response.json();
            updateDashboardUI(data.dashboard);
        } else {
            // Fallback to localStorage
            loadLocalDashboardData();
        }
    } catch (error) {
        console.log('Using local data:', error.message);
        loadLocalDashboardData();
    }
}

function loadLocalDashboardData() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || getLocalProducts();
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);
    const totalProducts = products.length;
    
    // Count users (from orders)
    const uniqueEmails = new Set(orders.map(o => o.shipping?.email).filter(Boolean));
    const totalUsers = Math.max(uniqueEmails.size, 1);
    
    // Update UI
    updateStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalUsers
    });
    
    // Load recent orders
    loadRecentOrders(orders.slice(-5).reverse());
}

function updateDashboardUI(dashboard) {
    const { overview, today, monthly, alerts, recentOrders } = dashboard;
    
    updateStats({
        totalProducts: overview.totalProducts,
        totalOrders: overview.totalOrders,
        totalRevenue: overview.totalRevenue,
        totalUsers: overview.totalUsers
    });
    
    // Update today's stats
    if (document.getElementById('todayOrders')) {
        document.getElementById('todayOrders').textContent = today.orders;
    }
    if (document.getElementById('pendingOrders')) {
        document.getElementById('pendingOrders').textContent = today.pendingOrders;
    }
    
    // Load recent orders
    loadRecentOrders(recentOrders);
    
    // Show alerts
    if (alerts.lowStockCount > 0) {
        showAlert(`${alerts.lowStockCount} products have low stock!`, 'warning');
    }
}

function updateStats(stats) {
    const elements = {
        totalProducts: document.getElementById('totalProducts'),
        totalOrders: document.getElementById('totalOrders'),
        totalRevenue: document.getElementById('totalRevenue'),
        totalUsers: document.getElementById('totalUsers')
    };
    
    if (elements.totalProducts) {
        elements.totalProducts.textContent = stats.totalProducts || 0;
    }
    if (elements.totalOrders) {
        elements.totalOrders.textContent = stats.totalOrders || 0;
    }
    if (elements.totalRevenue) {
        elements.totalRevenue.textContent = '$' + (stats.totalRevenue || 0).toFixed(2);
    }
    if (elements.totalUsers) {
        elements.totalUsers.textContent = stats.totalUsers || 0;
    }
}

function loadRecentOrders(orders) {
    const tbody = document.getElementById('recentOrders');
    if (!tbody) return;
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    No orders yet. Orders will appear here when customers make purchases.
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        const date = new Date(order.date || order.createdAt).toLocaleDateString();
        const customer = order.shipping ? 
            `${order.shipping.firstName} ${order.shipping.lastName}` : 
            (order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : 'Guest');
        const status = order.status || 'pending';
        const orderId = order.orderId || order.orderNumber || order._id;
        const total = order.totals?.total || order.total || 0;
        const itemCount = order.items?.length || 0;
        
        html += `
            <tr data-order-id="${orderId}">
                <td><strong>${orderId}</strong></td>
                <td>${customer}</td>
                <td>${date}</td>
                <td>${itemCount} items</td>
                <td><strong>$${total.toFixed(2)}</strong></td>
                <td>
                    <span class="status-badge status-${status}">
                        ${formatStatus(status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewOrder('${orderId}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="updateOrderStatus('${orderId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?limit=100`);
        
        if (response.ok) {
            const data = await response.json();
            adminState.products = data.products;
            renderProductsTable(data.products);
        } else {
            loadLocalProducts();
        }
    } catch (error) {
        console.log('Loading local products:', error.message);
        loadLocalProducts();
    }
}

function loadLocalProducts() {
    const products = getLocalProducts();
    adminState.products = products;
    renderProductsTable(products);
}

function getLocalProducts() {
    // Get products from the products.js database or localStorage
    if (typeof productsDatabase !== 'undefined') {
        return productsDatabase;
    }
    return JSON.parse(localStorage.getItem('products')) || [];
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    No products found. Add your first product!
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    products.forEach(product => {
        const stockStatus = product.stock > 10 ? 'In Stock' : 
                           product.stock > 0 ? 'Low Stock' : 'Out of Stock';
        const stockClass = product.stock > 10 ? 'delivered' : 
                          product.stock > 0 ? 'processing' : 'cancelled';
        
        html += `
            <tr data-product-id="${product.id || product._id}">
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 50px; height: 50px; background: #f0f4ff; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i class="${product.icon || 'fas fa-box'}" style="color: #667eea; font-size: 1.2rem;"></i>
                        </div>
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>${formatCategory(product.category)}</td>
                <td><strong>$${product.price.toFixed(2)}</strong></td>
                <td>${product.stock || 0}</td>
                <td><span class="status-badge status-${stockClass}">${stockStatus}</span></td>
                <td>⭐ ${product.rating?.average || product.rating || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewProduct('${product.id || product._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editProduct('${product.id || product._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct('${product.id || product._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function addNewProduct() {
    showModal('addProduct');
}

function editProduct(productId) {
    const product = adminState.products.find(p => (p.id || p._id) === productId);
    if (product) {
        showProductForm(product);
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Delete from API or localStorage
        console.log('Deleting product:', productId);
        showNotification('Product deleted successfully', 'success');
        loadProducts();
    }
}

function viewProduct(productId) {
    const product = adminState.products.find(p => (p.id || p._id) === productId);
    if (product) {
        showProductDetails(product);
    }
}

// ============================================
// ORDERS MANAGEMENT
// ============================================

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        
        if (response.ok) {
            const data = await response.json();
            adminState.orders = data.orders;
            renderOrdersTable(data.orders);
        } else {
            loadLocalOrders();
        }
    } catch (error) {
        console.log('Loading local orders:', error.message);
        loadLocalOrders();
    }
}

function loadLocalOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    adminState.orders = orders;
    renderOrdersTable(orders);
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: #ccc;"></i>
                    No orders yet
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        const date = new Date(order.date || order.createdAt).toLocaleDateString();
        const customer = order.shipping ? 
            `${order.shipping.firstName} ${order.shipping.lastName}` : 
            (order.user?.firstName || 'Guest');
        const email = order.shipping?.email || order.customerEmail || '-';
        const status = order.status || 'pending';
        const orderId = order.orderId || order.orderNumber;
        const total = order.totals?.total || order.total || 0;
        
        html += `
            <tr data-order-id="${orderId}">
                <td><strong>${orderId}</strong></td>
                <td>
                    <div>${customer}</div>
                    <small style="color: #666;">${email}</small>
                </td>
                <td>${date}</td>
                <td>${order.items?.length || 0}</td>
                <td><strong>$${total.toFixed(2)}</strong></td>
                <td>
                    <select class="status-select" onchange="changeOrderStatus('${orderId}', this.value)">
                        <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewOrder('${orderId}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="printInvoice('${orderId}')">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function viewOrder(orderId) {
    const order = adminState.orders.find(o => (o.orderId || o.orderNumber) === orderId) ||
                  JSON.parse(localStorage.getItem('orders'))?.find(o => o.orderId === orderId);
    
    if (order) {
        showOrderDetails(order);
    } else {
        showNotification('Order not found', 'error');
    }
}

function changeOrderStatus(orderId, newStatus) {
    // Update in localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification(`Order status updated to ${formatStatus(newStatus)}`, 'success');
    }
    
    // Also try API
    fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    }).catch(err => console.log('API update failed, using local storage'));
}

function updateOrderStatus(orderId) {
    const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
    if (newStatus) {
        changeOrderStatus(orderId, newStatus.toLowerCase());
    }
}

function printInvoice(orderId) {
    const order = adminState.orders.find(o => (o.orderId || o.orderNumber) === orderId);
    if (order) {
        // Open invoice in new window
        const invoiceWindow = window.open('', '_blank');
        invoiceWindow.document.write(generateInvoiceHTML(order));
        invoiceWindow.document.close();
        invoiceWindow.print();
    }
}

function generateInvoiceHTML(order) {
    const date = new Date(order.date || order.createdAt).toLocaleDateString();
    const customer = order.shipping || {};
    
    let itemsHTML = '';
    (order.items || []).forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
    });
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${order.orderId || order.orderNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #667eea; }
                .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f8f9fa; }
                .total { text-align: right; font-size: 18px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">ShopEase</div>
                <h2>Invoice</h2>
            </div>
            <div class="invoice-info">
                <div>
                    <strong>Order #:</strong> ${order.orderId || order.orderNumber}<br>
                    <strong>Date:</strong> ${date}<br>
                    <strong>Status:</strong> ${formatStatus(order.status)}
                </div>
                <div>
                    <strong>Bill To:</strong><br>
                    ${customer.firstName || ''} ${customer.lastName || ''}<br>
                    ${customer.address || ''}<br>
                    ${customer.city || ''}, ${customer.state || ''} ${customer.zip || ''}<br>
                    ${customer.email || ''}
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            <div class="total">
                <p>Subtotal: $${(order.totals?.subtotal || order.subtotal || 0).toFixed(2)}</p>
                <p>Tax: $${(order.totals?.tax || order.tax || 0).toFixed(2)}</p>
                <p>Shipping: $${(order.totals?.shipping || order.shippingCost || 0).toFixed(2)}</p>
                <hr>
                <p style="font-size: 24px;">Total: $${(order.totals?.total || order.total || 0).toFixed(2)}</p>
            </div>
        </body>
        </html>
    `;
}

// ============================================
// USERS MANAGEMENT
// ============================================

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        
        if (response.ok) {
            const data = await response.json();
            adminState.users = data.users;
            renderUsersTable(data.users);
        } else {
            renderUsersTable([]);
        }
    } catch (error) {
        console.log('Could not load users:', error.message);
        renderUsersTable([]);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: #ccc;"></i>
                    No users registered yet
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    users.forEach(user => {
        const date = new Date(user.createdAt).toLocaleDateString();
        const status = user.isActive ? 'Active' : 'Inactive';
        const statusClass = user.isActive ? 'delivered' : 'cancelled';
        
        html += `
            <tr data-user-id="${user._id}">
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                            ${(user.firstName || 'U')[0]}${(user.lastName || '')[0]}
                        </div>
                        <div>
                            <div>${user.firstName} ${user.lastName}</div>
                            <small style="color: #666;">${user.email}</small>
                        </div>
                    </div>
                </td>
                <td>${formatRole(user.role)}</td>
                <td>${date}</td>
                <td><span class="status-badge status-${statusClass}">${status}</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewUser('${user._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editUserRole('${user._id}')">
                            <i class="fas fa-user-cog"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ============================================
// ANALYTICS
// ============================================

async function loadAnalytics() {
    try {
        const [salesRes, productsRes] = await Promise.all([
            fetch(`${API_BASE}/admin/analytics/sales`),
            fetch(`${API_BASE}/admin/analytics/products`)
        ]);
        
        if (salesRes.ok && productsRes.ok) {
            const salesData = await salesRes.json();
            const productsData = await productsRes.json();
            
            renderAnalytics({
                sales: salesData.analytics,
                products: productsData.analytics
            });
        } else {
            renderLocalAnalytics();
        }
    } catch (error) {
        console.log('Loading local analytics:', error.message);
        renderLocalAnalytics();
    }
}

function renderLocalAnalytics() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Calculate daily sales from local orders
    const dailySales = {};
    orders.forEach(order => {
        const date = new Date(order.date).toISOString().split('T')[0];
        if (!dailySales[date]) {
            dailySales[date] = { revenue: 0, orders: 0 };
        }
        dailySales[date].revenue += order.totals?.total || 0;
        dailySales[date].orders += 1;
    });
    
    renderSalesChart(Object.entries(dailySales).map(([date, data]) => ({
        _id: date,
        ...data
    })));
}

function renderAnalytics(data) {
    if (data.sales?.dailySales) {
        renderSalesChart(data.sales.dailySales);
    }
    if (data.sales?.categorySales) {
        renderCategoryChart(data.sales.categorySales);
    }
    if (data.products?.topProducts) {
        renderTopProducts(data.products.topProducts);
    }
}

function renderSalesChart(dailySales) {
    const chartContainer = document.getElementById('salesChart');
    if (!chartContainer) return;
    
    if (dailySales.length === 0) {
        chartContainer.innerHTML = '<p style="text-align: center; color: #666;">No sales data yet</p>';
        return;
    }
    
    // Simple bar chart using CSS
    const maxRevenue = Math.max(...dailySales.map(d => d.revenue));
    
    let html = '<div class="simple-chart">';
    dailySales.slice(-7).forEach(day => {
        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
        const date = new Date(day._id).toLocaleDateString('en', { weekday: 'short' });
        
        html += `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${height}%;">
                    <span class="chart-value">$${day.revenue.toFixed(0)}</span>
                </div>
                <span class="chart-label">${date}</span>
            </div>
        `;
    });
    html += '</div>';
    
    chartContainer.innerHTML = html;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatCategory(category) {
    return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Other';
}

function formatRole(role) {
    const roles = {
        'admin': '👑 Admin',
        'moderator': '🛡️ Moderator',
        'customer': '👤 Customer'
    };
    return roles[role] || role;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showAlert(message, type = 'info') {
    showNotification(message, type);
}

function refreshData() {
    loadSectionData(adminState.currentSection);
    showNotification('Data refreshed!', 'success');
}

function refreshDashboard() {
    if (adminState.currentSection === 'dashboard') {
        loadDashboardData();
    }
}

function showOrderDetails(order) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Order Details - ${order.orderId || order.orderNumber}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="order-detail-grid">
                    <div class="detail-section">
                        <h4>Customer Information</h4>
                        <p><strong>Name:</strong> ${order.shipping?.firstName || ''} ${order.shipping?.lastName || ''}</p>
                        <p><strong>Email:</strong> ${order.shipping?.email || order.customerEmail || '-'}</p>
                        <p><strong>Phone:</strong> ${order.shipping?.phone || '-'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Shipping Address</h4>
                        <p>${order.shipping?.address || '-'}</p>
                        <p>${order.shipping?.city || ''}, ${order.shipping?.state || ''} ${order.shipping?.zip || ''}</p>
                    </div>
                </div>
                <h4>Order Items</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(order.items || []).map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="order-totals">
                    <p>Subtotal: $${(order.totals?.subtotal || order.subtotal || 0).toFixed(2)}</p>
                    <p>Tax: $${(order.totals?.tax || order.tax || 0).toFixed(2)}</p>
                    <p>Shipping: $${(order.totals?.shipping || order.shippingCost || 0).toFixed(2)}</p>
                    <p class="total"><strong>Total: $${(order.totals?.total || order.total || 0).toFixed(2)}</strong></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showProductDetails(product) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${product.name}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="product-detail-content">
                    <div class="product-icon-large">
                        <i class="${product.icon || 'fas fa-box'}"></i>
                    </div>
                    <div class="product-info-grid">
                        <p><strong>Category:</strong> ${formatCategory(product.category)}</p>
                        <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                        <p><strong>Stock:</strong> ${product.stock || 0} units</p>
                        <p><strong>Rating:</strong> ⭐ ${product.rating?.average || product.rating || 0}</p>
                    </div>
                    <p><strong>Description:</strong></p>
                    <p>${product.description}</p>
                    ${product.features ? `
                        <p><strong>Features:</strong></p>
                        <ul>
                            ${product.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showProductForm(product = null) {
    const isEdit = !!product;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="productForm" class="admin-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Product Name</label>
                            <input type="text" name="name" value="${product?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <select name="category" required>
                                <option value="electronics" ${product?.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                                <option value="fashion" ${product?.category === 'fashion' ? 'selected' : ''}>Fashion</option>
                                <option value="home" ${product?.category === 'home' ? 'selected' : ''}>Home</option>
                                <option value="sports" ${product?.category === 'sports' ? 'selected' : ''}>Sports</option>
                                <option value="books" ${product?.category === 'books' ? 'selected' : ''}>Books</option>
                                <option value="beauty" ${product?.category === 'beauty' ? 'selected' : ''}>Beauty</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Price ($)</label>
                            <input type="number" name="price" step="0.01" value="${product?.price || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" name="stock" value="${product?.stock || 0}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="3" required>${product?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Icon Class (FontAwesome)</label>
                        <input type="text" name="icon" value="${product?.icon || 'fas fa-box'}" placeholder="fas fa-box">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Product</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Handle form submission
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const productData = Object.fromEntries(formData.entries());
        productData.price = parseFloat(productData.price);
        productData.stock = parseInt(productData.stock);
        
        console.log('Product data:', productData);
        showNotification(`Product ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
        modal.remove();
        loadProducts();
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = cart.length;
    });
}

// Export orders function
function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || adminState.orders;
    
    if (orders.length === 0) {
        showNotification('No orders to export', 'warning');
        return;
    }
    
    // Create CSV
    let csv = 'Order ID,Customer,Email,Date,Items,Total,Status\n';
    orders.forEach(order => {
        const customer = order.shipping ? `${order.shipping.firstName} ${order.shipping.lastName}` : 'Guest';
        const email = order.shipping?.email || order.customerEmail || '';
        const date = new Date(order.date || order.createdAt).toLocaleDateString();
        const total = order.totals?.total || order.total || 0;
        
        csv += `"${order.orderId || order.orderNumber}","${customer}","${email}","${date}",${order.items?.length || 0},$${total.toFixed(2)},${order.status}\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Orders exported successfully!', 'success');
}

function addNewUser() {
    showNotification('User registration is available on the registration page', 'info');
}
