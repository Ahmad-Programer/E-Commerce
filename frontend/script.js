// ============================================
// E-COMMERCE WEBSITE - MAIN JAVASCRIPT
// ShopEase - Interactive Features
// ============================================

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ ShopEase website loaded successfully!');
    
    // Initialize all features
    initCart();
    initSearch();
    initAnimations();
    
    // Update cart count on page load
    updateCartCount();
    
    // Only load featured products on homepage
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadFeaturedProducts();
    }
});

// ============================================
// CART FUNCTIONALITY
// ============================================
var cart = JSON.parse(localStorage.getItem('cart')) || [];

function initCart() {
    console.log('🛒 Cart system initialized');
    
    // Load cart from localStorage
    loadCart();
    
    // Add event listeners to all "Add to Cart" buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-cart') || 
            event.target.parentElement.classList.contains('btn-cart')) {
            const productElement = event.target.closest('.product-card');
            if (productElement) {
                addToCart(productElement);
            }
        }
    });
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log(`📦 Loaded ${cart.length} items from cart`);
    }
}

function addToCart(productElement) {
    // Get product details
    const productId = productElement.dataset.id || Date.now().toString();
    const productName = productElement.querySelector('h3').textContent;
    const productPrice = productElement.querySelector('.current-price')?.textContent || 
                        productElement.querySelector('.product-price').textContent;
    
    // Extract numeric price
    const price = parseFloat(productPrice.replace(/[^0-9.]/g, ''));
    
    // Create product object
    const product = {
        id: productId,
        name: productName,
        price: price,
        quantity: 1,
        image: productElement.querySelector('.product-image i')?.className || 'fas fa-box'
    };
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`Increased quantity of ${productName} in cart`);
    } else {
        cart.push(product);
        showNotification(`${productName} added to cart!`);
    }
    
    // Save to localStorage
    saveCart();
    
    // Update cart count
    updateCartCount();
    
    // Add animation effect
    const button = productElement.querySelector('.btn-cart');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    console.log(`🛍️ Cart updated: ${totalItems} items`);
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    showNotification('Cart cleared!');
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        // Search on button click
        searchBtn.addEventListener('click', performSearch);
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        console.log(`🔍 Searching for: ${searchTerm}`);
        
        // In a real app, this would be an API call
        // For now, just show a notification
        showNotification(`Searching for "${searchTerm}"...`);
        
        // Clear search input
        searchInput.value = '';
        
        // Scroll to products section
        const productsSection = document.querySelector('.featured-products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        showNotification('Please enter a search term', 'warning');
    }
}

// ============================================
// PRODUCTS FUNCTIONALITY
// ============================================
function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featuredProducts');
    
    if (!productsGrid) return;
    
    console.log('📦 Loading featured products...');
    
    // Sample products data
    const products = [
        {
            id: 1,
            name: 'Wireless Bluetooth Headphones',
            price: 49.99,
            oldPrice: 79.99,
            rating: 4.5,
            category: 'Electronics',
            icon: 'fas fa-headphones'
        },
        {
            id: 2,
            name: 'Smart Watch Series 5',
            price: 199.99,
            oldPrice: 249.99,
            rating: 4.7,
            category: 'Electronics',
            icon: 'fas fa-clock'
        },
        {
            id: 3,
            name: 'Cotton T-Shirt (Pack of 3)',
            price: 24.99,
            oldPrice: 34.99,
            rating: 4.3,
            category: 'Fashion',
            icon: 'fas fa-tshirt'
        },
        {
            id: 4,
            name: 'Stainless Steel Water Bottle',
            price: 19.99,
            oldPrice: 29.99,
            rating: 4.8,
            category: 'Sports',
            icon: 'fas fa-wine-bottle'
        },
        {
            id: 5,
            name: 'USB-C Fast Charger',
            price: 29.99,
            oldPrice: 39.99,
            rating: 4.4,
            category: 'Electronics',
            icon: 'fas fa-bolt'
        },
        {
            id: 6,
            name: 'Yoga Mat Premium',
            price: 34.99,
            oldPrice: 49.99,
            rating: 4.6,
            category: 'Sports',
            icon: 'fas fa-dumbbell'
        }
    ];
    
    // Clear loading message
    productsGrid.innerHTML = '';
    
    // Add products to grid
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    console.log(`✅ Loaded ${products.length} products`);
}

function createProductCard(product) {
    const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    
    card.innerHTML = `
        <div class="product-image">
            <i class="${product.icon}"></i>
            <span class="product-badge">-${discount}%</span>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-rating">
                ${createStarRating(product.rating)}
                <span style="color: var(--gray-color); font-size: 0.9rem; margin-left: 5px;">
                    (${product.rating})
                </span>
            </div>
            <div class="product-price">
                <span class="current-price">$${product.price.toFixed(2)}</span>
                <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                <span class="discount">Save $${(product.oldPrice - product.price).toFixed(2)}</span>
            </div>
            <div class="product-actions">
                <button class="btn-cart">Add to Cart</button>
                <button class="btn-view">View Details</button>
            </div>
        </div>
    `;
    
    // Add click event to "View Details" button
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', function() {
        showProductDetails(product);
    });
    
    return card;
}

function createStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function showProductDetails(product) {
    showNotification(`Viewing details for ${product.name}`, 'info');
    
    // In a real app, this would navigate to product detail page
    // For now, show an alert with product info
    const detailMessage = `
        Product: ${product.name}
        Price: $${product.price}
        Category: ${product.category}
        Rating: ${product.rating}/5
        
        This is a sample product. In a real website, 
        this would show complete product details, 
        images, specifications, and reviews.
    `;
    
    alert(detailMessage);
}

// ============================================
// ANIMATIONS & EFFECTS
// ============================================
function initAnimations() {
    // Add hover effect to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add scroll animations
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = 'var(--shadow-lg)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-md)';
        }
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 
                     type === 'warning' ? 'var(--warning-color)' : 
                     type === 'info' ? 'var(--primary-color)' : 'var(--dark-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin: 0;
        line-height: 1;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add close functionality
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 3000);
    
    // Add to page
    document.body.appendChild(notification);
    
    console.log(`📢 Notification: ${message}`);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ============================================
// DEBUG HELPERS
// ============================================
// Add these to browser console for testing
window.debugCart = function() {
    console.log('🛒 Current Cart:', cart);
    console.log('💰 Total:', formatPrice(getCartTotal()));
    console.log('📦 Items:', cart.length);
};

window.clearCart = clearCart;
window.addSampleProducts = function() {
    // Add sample products to cart for testing
    const sampleProducts = [
        { id: 1, name: 'Test Product 1', price: 19.99, quantity: 1 },
        { id: 2, name: 'Test Product 2', price: 29.99, quantity: 2 }
    ];
    
    cart = [...cart, ...sampleProducts];
    saveCart();
    updateCartCount();
    showNotification('Added sample products to cart');
};

// Log initialization
console.log('🚀 ShopEase JavaScript initialized');
console.log('Available debug functions:');
console.log('- debugCart(): Show cart contents');
console.log('- clearCart(): Clear all cart items');
console.log('- addSampleProducts(): Add test products');