// ============================================
// PRODUCTS MODULE - Separate JavaScript File
// ============================================

// Product Database (In real app, this would come from backend API)
const productsDatabase = [
    {
        id: 'P001',
        name: 'Wireless Bluetooth Headphones',
        description: 'Noise-cancelling headphones with 30-hour battery life, perfect for music lovers and professionals.',
        price: 89.99,
        oldPrice: 129.99,
        category: 'electronics',
        rating: 4.5,
        reviews: 128,
        inStock: true,
        images: ['headphones'],
        features: ['Noise Cancellation', '30hr Battery', 'Bluetooth 5.0', 'Foldable'],
        icon: 'fas fa-headphones'
    },
    {
        id: 'P002',
        name: 'Smart Watch Series 5',
        description: 'Advanced smartwatch with health monitoring, GPS, and waterproof design for active lifestyles.',
        price: 249.99,
        oldPrice: 299.99,
        category: 'electronics',
        rating: 4.7,
        reviews: 89,
        inStock: true,
        images: ['smartwatch'],
        features: ['Heart Rate Monitor', 'GPS', 'Waterproof', '7-day Battery'],
        icon: 'fas fa-clock'
    },
    {
        id: 'P003',
        name: 'Premium Cotton T-Shirt (Pack of 3)',
        description: '100% cotton t-shirts in various colors, comfortable for daily wear and perfect for casual outings.',
        price: 34.99,
        oldPrice: 49.99,
        category: 'fashion',
        rating: 4.3,
        reviews: 256,
        inStock: true,
        images: ['tshirt'],
        features: ['100% Cotton', 'Machine Wash', 'Color Fast', 'Breathable'],
        icon: 'fas fa-tshirt'
    },
    {
        id: 'P004',
        name: 'Stainless Steel Water Bottle',
        description: 'Insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
        price: 24.99,
        oldPrice: 34.99,
        category: 'sports',
        rating: 4.8,
        reviews: 312,
        inStock: true,
        images: ['bottle'],
        features: ['24hr Cold', '12hr Hot', 'BPA Free', 'Leak Proof'],
        icon: 'fas fa-wine-bottle'
    },
    {
        id: 'P005',
        name: 'USB-C Fast Charger 65W',
        description: 'Compact fast charger compatible with laptops, phones, and tablets. Charges 0-50% in 30 minutes.',
        price: 39.99,
        oldPrice: 59.99,
        category: 'electronics',
        rating: 4.4,
        reviews: 167,
        inStock: true,
        images: ['charger'],
        features: ['65W Output', 'Multi-Device', 'Compact Design', 'Safety Certified'],
        icon: 'fas fa-bolt'
    },
    {
        id: 'P006',
        name: 'Professional Yoga Mat',
        description: 'Extra thick yoga mat with non-slip surface, perfect for all types of exercises and yoga practices.',
        price: 44.99,
        oldPrice: 64.99,
        category: 'sports',
        rating: 4.6,
        reviews: 189,
        inStock: true,
        images: ['yogamat'],
        features: ['Non-Slip', 'Eco-Friendly', '6mm Thick', 'Easy to Clean'],
        icon: 'fas fa-dumbbell'
    },
    {
        id: 'P007',
        name: 'Laptop Backpack Waterproof',
        description: 'Durable backpack with laptop compartment, multiple pockets, and water-resistant material.',
        price: 59.99,
        oldPrice: 79.99,
        category: 'fashion',
        rating: 4.5,
        reviews: 94,
        inStock: true,
        images: ['backpack'],
        features: ['Waterproof', 'Laptop Sleeve', 'USB Port', 'Ergonomic Design'],
        icon: 'fas fa-briefcase'
    },
    {
        id: 'P008',
        name: 'Wireless Gaming Mouse',
        description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons.',
        price: 69.99,
        oldPrice: 89.99,
        category: 'electronics',
        rating: 4.7,
        reviews: 203,
        inStock: true,
        images: ['mouse'],
        features: ['Wireless', 'RGB Lighting', 'Programmable', '16000 DPI'],
        icon: 'fas fa-mouse'
    }
];

// Product Categories
const categories = [
    { id: 'all', name: 'All Products', icon: 'fas fa-boxes', count: 8 },
    { id: 'electronics', name: 'Electronics', icon: 'fas fa-mobile-alt', count: 4 },
    { id: 'fashion', name: 'Fashion', icon: 'fas fa-tshirt', count: 2 },
    { id: 'sports', name: 'Sports', icon: 'fas fa-dumbbell', count: 2 },
    { id: 'home', name: 'Home & Living', icon: 'fas fa-home', count: 0 }
];

// Initialize products module
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Products module loaded');
    
    // Check if we're on products page
    if (window.location.pathname === '/products' || window.location.pathname.includes('products.html')) {
        initProductsPage();
    } else {
        // Load featured products on homepage
        loadFeaturedProducts();
    }
});

// ============================================
// PRODUCTS PAGE FUNCTIONALITY
// ============================================
function initProductsPage() {
    console.log('Initializing products page...');
    
    // Load all products
    displayProducts(productsDatabase);
    
    // Load categories filter
    loadCategoriesFilter();
    
    // Setup search functionality
    setupProductSearch();
    
    // Setup sorting
    setupProductSorting();
    
    // Setup price filter
    setupPriceFilter();
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // Clear existing products
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    // Create product cards
    products.forEach(product => {
        const productCard = createProductCard(product, true); // true = detailed view
        productsGrid.appendChild(productCard);
    });
    
    // Update product count
    updateProductCount(products.length);
}

function createProductCard(product, detailed = false) {
    const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.dataset.category = product.category;
    card.dataset.price = product.price;
    
    if (detailed) {
        // Detailed card for products page
        card.innerHTML = `
            <div class="product-image">
                <i class="${product.icon}"></i>
                ${product.inStock ? '<span class="stock-badge in-stock">In Stock</span>' : '<span class="stock-badge out-stock">Out of Stock</span>'}
                ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3>${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 80)}...</p>
                <div class="product-rating">
                    ${createStarRating(product.rating)}
                    <span class="review-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.oldPrice > product.price ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="product-features">
                    ${product.features.slice(0, 2).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="product-actions">
                    <button class="btn-cart" ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button class="btn-view">View Details</button>
                </div>
            </div>
        `;
    } else {
        // Simple card for homepage
        card.innerHTML = `
            <div class="product-image">
                <i class="${product.icon}"></i>
                ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">
                    ${createStarRating(product.rating)}
                </div>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.oldPrice > product.price ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-cart">Add to Cart</button>
                    <button class="btn-view">View Details</button>
                </div>
            </div>
        `;
    }
    
    // Add event listeners
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', function() {
        showProductModal(product);
    });
    
    const cartBtn = card.querySelector('.btn-cart');
    if (!cartBtn.disabled) {
        cartBtn.addEventListener('click', function() {
            addToCartFromCard(product, card);
        });
    }
    
    return card;
}

function addToCartFromCard(product, cardElement) {
    // This would be called from the main script.js
    if (typeof addToCart === 'function') {
        addToCart(cardElement);
    } else {
        // Fallback if main script not loaded
        console.log('Add to cart clicked for:', product.name);
        alert(`${product.name} added to cart!`);
    }
}

// ============================================
// FILTER & SORT FUNCTIONALITY
// ============================================
function loadCategoriesFilter() {
    const categoriesContainer = document.getElementById('categoriesFilter');
    if (!categoriesContainer) return;
    
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-filter-item';
        categoryElement.dataset.category = category.id;
        categoryElement.innerHTML = `
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
            <span class="category-count">${category.count}</span>
        `;
        
        categoryElement.addEventListener('click', function() {
            filterByCategory(category.id);
            // Update active state
            document.querySelectorAll('.category-filter-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        categoriesContainer.appendChild(categoryElement);
    });
}

function filterByCategory(categoryId) {
    let filteredProducts;
    
    if (categoryId === 'all') {
        filteredProducts = productsDatabase;
    } else {
        filteredProducts = productsDatabase.filter(product => product.category === categoryId);
    }
    
    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

function setupProductSearch() {
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            displayProducts(productsDatabase);
            return;
        }
        
        const filteredProducts = productsDatabase.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        
        displayProducts(filteredProducts);
    });
}

function setupProductSorting() {
    const sortSelect = document.getElementById('sortProducts');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        let sortedProducts = [...productsDatabase];
        
        switch(sortBy) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sortedProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Default: newest first (by ID)
                break;
        }
        
        displayProducts(sortedProducts);
    });
}

function setupPriceFilter() {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    
    if (!priceRange || !priceValue) return;
    
    // Update price display
    priceRange.addEventListener('input', function() {
        priceValue.textContent = `$${this.value}`;
        
        const maxPrice = parseFloat(this.value);
        const filteredProducts = productsDatabase.filter(product => product.price <= maxPrice);
        
        displayProducts(filteredProducts);
    });
}

// ============================================
// PRODUCT MODAL/DETAILS
// ============================================
function showProductModal(product) {
    // Create modal HTML
    const modalHTML = `
        <div class="product-modal">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-image">
                        <i class="${product.icon}"></i>
                    </div>
                    <div class="modal-details">
                        <div class="product-category">${getCategoryName(product.category)}</div>
                        <h2>${product.name}</h2>
                        <div class="product-rating">
                            ${createStarRating(product.rating)}
                            <span class="review-count">${product.reviews} reviews</span>
                        </div>
                        <p class="product-description">${product.description}</p>
                        
                        <div class="product-features">
                            <h4>Features:</h4>
                            <ul>
                                ${product.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="product-price-large">
                            <span class="current-price">$${product.price.toFixed(2)}</span>
                            ${product.oldPrice > product.price ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
                            ${product.oldPrice > product.price ? 
                                `<span class="discount">Save $${(product.oldPrice - product.price).toFixed(2)}</span>` : ''}
                        </div>
                        
                        <div class="stock-status">
                            <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            ${product.inStock ? 'In Stock - Ready to ship' : 'Out of Stock'}
                        </div>
                        
                        <div class="modal-actions">
                            <button class="btn-cart-large" ${!product.inStock ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus"></i>
                                ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button class="btn-wishlist">
                                <i class="far fa-heart"></i>
                                Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles
    addModalStyles();
    
    // Setup modal functionality
    const modal = document.querySelector('.product-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const addToCartBtn = modal.querySelector('.btn-cart-large');
    
    // Close modal
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    // Add to cart from modal
    if (addToCartBtn && !addToCartBtn.disabled) {
        addToCartBtn.addEventListener('click', function() {
            // Create a temporary card element for the cart function
            const tempCard = document.createElement('div');
            tempCard.className = 'product-card';
            tempCard.dataset.id = product.id;
            const tempTitle = document.createElement('h3');
            tempTitle.textContent = product.name;
            tempCard.appendChild(tempTitle);
            
            if (typeof addToCart === 'function') {
                addToCart(tempCard);
                closeModal();
            }
        });
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.querySelector('.product-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function addModalStyles() {
    const styles = `
        <style>
            .product-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .modal-content {
                background: white;
                border-radius: var(--radius-lg);
                width: 90%;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--gray-color);
                cursor: pointer;
                z-index: 10;
            }
            
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                padding: 2rem;
            }
            
            .modal-image {
                background: linear-gradient(135deg, #f6f8ff 0%, #f0f4ff 100%);
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 3rem;
            }
            
            .modal-image i {
                font-size: 8rem;
                color: var(--primary-color);
                opacity: 0.7;
            }
            
            .modal-details {
                padding: 1rem 0;
            }
            
            .product-price-large {
                font-size: 2.5rem;
                font-weight: 700;
                color: var(--primary-color);
                margin: 1.5rem 0;
            }
            
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            .btn-cart-large {
                flex: 2;
                padding: 1rem;
                font-size: 1.1rem;
            }
            
            .btn-wishlist {
                flex: 1;
                padding: 1rem;
                background: var(--light-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-wishlist:hover {
                background: var(--border-color);
            }
            
            .feature-tag {
                display: inline-block;
                background: var(--light-color);
                padding: 0.25rem 0.75rem;
                border-radius: var(--radius-full);
                font-size: 0.8rem;
                margin-right: 0.5rem;
                margin-bottom: 0.5rem;
                border: 1px solid var(--border-color);
            }
            
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                }
                
                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
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

function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
}

function updateProductCount(count) {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = `(${count} products)`;
    }
}

// ============================================
// HOMEPAGE FEATURED PRODUCTS
// ============================================
function loadFeaturedProducts() {
    // Get featured products (first 4 products)
    const featuredProducts = productsDatabase.slice(0, 4);
    
    // This function will be called from main script.js
    console.log('Featured products loaded:', featuredProducts.length);
}

// Make functions available globally
window.filterByCategory = filterByCategory;
window.showProductModal = showProductModal;