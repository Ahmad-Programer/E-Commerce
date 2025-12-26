// ============================================
// CART MODULE - Shopping Cart Functionality
// ============================================

// Cart data structure (Array of items) - check if already defined
if (typeof cart === 'undefined') {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
}

// Current discount
var currentDiscount = 0;

// Initialize cart module
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Cart module loaded');
    
    // Always load cart from storage first
    loadCartFromStorage();
    
    // Always update cart count
    updateCartCount();
    
    // Load cart items if on cart page
    if (document.getElementById('cartItems')) {
        console.log('📱 Cart page detected - loading items...');
        loadCartItems();
        setupCartEventListeners();
        updateOrderSummary();
    }
});

// ============================================
// CART OPERATIONS (Using Array Data Structure)
// ============================================

// Load cart items to the page - SIMPLIFIED WORKING VERSION
function loadCartItems() {
    console.log('🔄 loadCartItems() called');
    
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartElement = document.getElementById('emptyCart');
    
    if (!cartItemsContainer) {
        console.error('❌ Cart container not found');
        return;
    }
    
    console.log('📦 Cart has', cart.length, 'items:', cart);
    
    // Clear ONLY cart items (keep empty cart message)
    const existingItems = cartItemsContainer.querySelectorAll('.cart-item:not(#emptyCart)');
    existingItems.forEach(item => item.remove());
    
    if (cart.length === 0) {
        console.log('🛒 Cart is empty');
        if (emptyCartElement) {
            emptyCartElement.style.display = 'block';
        }
        updateOrderSummary();
        return;
    }
    
    console.log('🛒 Showing cart items...');
    
    // Hide empty cart message
    if (emptyCartElement) {
        emptyCartElement.style.display = 'none';
    }
    
    // Add each item to display
    cart.forEach((item, index) => {
        console.log('➕ Adding item to display:', item.name);
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.index = index;
        
        // Calculate item total
        const itemTotal = item.price * item.quantity;
        
        // SIMPLE HTML that will definitely work
        cartItem.innerHTML = `
            <div class="item-image">
                <i class="${item.image || 'fas fa-box'}"></i>
            </div>
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <div class="item-category">${item.category || 'General'}</div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div class="item-quantity">
                    <button class="quantity-btn" data-index="${index}" data-action="decrease">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="1" max="99" data-index="${index}">
                    <button class="quantity-btn" data-index="${index}" data-action="increase">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="item-actions">
                <button class="remove-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
                <div class="item-total">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    console.log('✅ Cart items displayed');
    updateOrderSummary();
}

// Setup event listeners for cart interactions
function setupCartEventListeners() {
    console.log('🔧 Setting up cart event listeners');
    
    // Event delegation for dynamic elements
    document.addEventListener('click', function(event) {
        // Handle quantity buttons
        if (event.target.closest('.quantity-btn')) {
            const button = event.target.closest('.quantity-btn');
            const index = parseInt(button.dataset.index);
            const action = button.dataset.action;
            
            if (action === 'increase') {
                increaseQuantity(index);
            } else if (action === 'decrease') {
                decreaseQuantity(index);
            }
        }
        
        // Handle remove buttons
        if (event.target.closest('.remove-btn')) {
            const button = event.target.closest('.remove-btn');
            const index = parseInt(button.dataset.index);
            removeFromCart(index);
        }
    });
    
    // Quantity input changes
    document.addEventListener('change', function(event) {
        if (event.target.classList.contains('quantity-input')) {
            const index = parseInt(event.target.dataset.index);
            const newQuantity = parseInt(event.target.value);
            
            if (newQuantity >= 1 && newQuantity <= 99) {
                updateQuantity(index, newQuantity);
            } else {
                // Reset to current quantity
                event.target.value = cart[index].quantity;
            }
        }
    });
}

// ============================================
// CART ARRAY OPERATIONS
// ============================================

// Add item to cart (push to array)
function addToCart(product) {
    console.log('➕ Adding to cart:', product);
    
    // Check if product already exists in cart
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
        // Update quantity if exists
        cart[existingIndex].quantity += 1;
        console.log('📈 Increased quantity of', cart[existingIndex].name);
    } else {
        // Add new item to cart array
        cart.push({
            id: product.id || 'item_' + Date.now(),
            name: product.name,
            price: product.price,
            image: product.image || 'fas fa-box',
            category: product.category || 'General',
            quantity: 1
        });
        console.log('🆕 Added new item:', product.name);
    }
    
    saveCart();
    updateCartCount();
    
    // Update cart page if open
    if (document.getElementById('cartItems')) {
        loadCartItems();
    }
    
    // Show notification if function exists
    if (typeof showNotification === 'function') {
        showNotification(`${product.name} added to cart!`, 'success');
    } else {
        console.log('📢 Added to cart:', product.name);
    }
    
    return cart;
}

// Remove item from cart (splice from array)
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) {
        console.error('Invalid index:', index);
        return;
    }
    
    const removedItem = cart[index];
    console.log('🗑️ Removing item:', removedItem.name);
    
    // Remove item from array using splice
    cart.splice(index, 1);
    
    saveCart();
    loadCartItems();
    updateCartCount();
    
    if (typeof showNotification === 'function') {
        showNotification(`${removedItem.name} removed from cart`, 'info');
    }
    
    return cart;
}

// Update item quantity
function updateQuantity(index, newQuantity) {
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity = newQuantity;
    console.log('🔢 Updated quantity:', cart[index].name, '=', newQuantity);
    
    saveCart();
    loadCartItems();
    updateCartCount();
}

// Increase quantity (array modification)
function increaseQuantity(index) {
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity += 1;
    console.log('➕ Increased quantity:', cart[index].name, '=', cart[index].quantity);
    
    saveCart();
    loadCartItems();
    updateCartCount();
}

// Decrease quantity (array modification)
function decreaseQuantity(index) {
    if (index < 0 || index >= cart.length) return;
    
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        console.log('➖ Decreased quantity:', cart[index].name, '=', cart[index].quantity);
        
        saveCart();
        loadCartItems();
        updateCartCount();
    } else {
        // If quantity would become 0, remove item instead
        removeFromCart(index);
    }
}

// Clear entire cart (empty array)
function clearCart() {
    console.log('🧹 Clearing cart');
    cart = [];
    currentDiscount = 0;
    saveCart();
    
    if (document.getElementById('cartItems')) {
        loadCartItems();
    }
    
    updateCartCount();
    
    if (typeof showNotification === 'function') {
        showNotification('Cart cleared', 'info');
    }
    
    return cart;
}

// Get cart total (array reduce)
function getCartTotal() {
    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    return parseFloat(total.toFixed(2));
}

// Get cart item count (array reduce)
function getCartItemCount() {
    return cart.reduce((count, item) => {
        return count + item.quantity;
    }, 0);
}

// Find item in cart (array find)
function findInCart(productId) {
    return cart.find(item => item.id === productId);
}

// ============================================
// CART PERSISTENCE
// ============================================

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('💾 Cart saved to localStorage');
    console.log('Items:', cart.length, 'Total:', getCartTotal());
    
    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(cart)
    }));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('📦 Cart loaded from localStorage:', cart.length, 'items');
        } catch (error) {
            console.error('❌ Error parsing cart:', error);
            cart = [];
        }
    }
    return cart;
}

// ============================================
// ORDER SUMMARY CALCULATIONS
// ============================================

// Update order summary
function updateOrderSummary() {
    console.log('🧮 Updating order summary');
    
    const subtotal = getCartTotal();
    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    const discount = getDiscount();
    const total = subtotal + shipping + tax - discount;
    
    console.log('Calculations:', { subtotal, shipping, tax, discount, total });
    
    // Update UI elements
    updateSummaryElement('subtotal', subtotal);
    updateSummaryElement('shipping', shipping);
    updateSummaryElement('tax', tax);
    updateSummaryElement('discount', discount);
    updateSummaryElement('total', total);
    
    return { subtotal, shipping, tax, discount, total };
}

// Calculate shipping cost
function calculateShipping(subtotal) {
    if (subtotal === 0) return 0;
    if (subtotal >= 100) return 0; // Free shipping over $100
    return 5.99; // Standard shipping
}

// Calculate tax (8% for example)
function calculateTax(subtotal) {
    const tax = subtotal * 0.08;
    return parseFloat(tax.toFixed(2));
}

// Get discount amount
function getDiscount() {
    return currentDiscount;
}

function applyDiscount(amount) {
    currentDiscount = amount;
    updateOrderSummary();
    return currentDiscount;
}

function removeDiscount() {
    currentDiscount = 0;
    updateOrderSummary();
    return currentDiscount;
}

// Update summary element in UI
function updateSummaryElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        const formattedValue = value.toFixed(2);
        if (elementId === 'discount' && value > 0) {
            element.textContent = `-$${formattedValue}`;
        } else {
            element.textContent = `$${formattedValue}`;
        }
    }
}

// ============================================
// CART COUNT UPDATES
// ============================================

// Update cart count in navbar
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = getCartItemCount();
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    // Update checkout button state
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        if (totalItems === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.6';
            checkoutBtn.style.cursor = 'not-allowed';
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Cart is Empty';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout';
        }
    }
    
    return totalItems;
}

// ============================================
// EXPORT FUNCTIONS (for use in other files)
// ============================================

window.cartModule = {
    // Core operations
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    
    // Getters
    getCart: () => cart,
    getCartTotal,
    getCartItemCount,
    findInCart,
    
    // Order Summary
    updateOrderSummary,
    applyDiscount,
    removeDiscount,
    
    // Display
    loadCartItems,
    
    // Utilities
    updateCartCount,
    saveCart
};

// Initialize on load
console.log('✅ Cart module ready');
console.log('📊 Initial cart state:', cart.length, 'items');