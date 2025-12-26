# 🛒 ShopEase - E-Commerce Website

A full-stack e-commerce website built with Node.js, Express, MongoDB, and vanilla JavaScript. This project features a modern, responsive design with a complete shopping experience.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Pages Overview](#-pages-overview)

---

## ✨ Features

### Customer Features
- 🏠 **Beautiful Homepage** - Hero section, featured products, categories
- 🛍️ **Product Catalog** - Browse products with filtering and search
- 🛒 **Shopping Cart** - Add, remove, update quantities with localStorage
- 💳 **Checkout Process** - Multi-step checkout with order summary
- 👤 **User Dashboard** - Order history, profile management
- 📦 **Order Tracking** - Real-time order status tracking
- ❤️ **Wishlist** - Save favorite products for later

### Admin Features
- 📊 **Dashboard Overview** - Sales statistics, revenue tracking, orders
- 📦 **Product Management** - Add, edit, delete products
- 📋 **Order Management** - View and update order status
- 👥 **User Management** - View and manage registered users
- 📈 **Analytics** - Sales charts, category performance, inventory alerts
- 🖨️ **Invoice Generation** - Print professional order invoices

### Technical Features
- 🔐 **JWT Authentication** - Secure user authentication
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Beautiful gradients and smooth animations
- 💾 **Local Storage** - Cart persistence across sessions
- 🔄 **RESTful API** - Well-structured API endpoints

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling (Flexbox, Grid, Custom Properties) |
| JavaScript (ES6+) | Functionality |
| Font Awesome | Icons |
| Google Fonts | Typography (Poppins, Montserrat) |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication |
| bcrypt.js | Password Hashing |

---

## 📁 Project Structure

```
E-Commerce/
├── 📂 backend/
│   ├── 📂 models/
│   │   ├── User.js          # User schema with authentication
│   │   ├── Product.js       # Product schema with reviews
│   │   ├── Order.js         # Order schema with status tracking
│   │   └── index.js         # Export all models
│   │
│   ├── 📂 routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── products.js      # Product CRUD routes
│   │   ├── orders.js        # Order management routes
│   │   ├── admin.js         # Admin dashboard routes
│   │   └── index.js         # Export all routes
│   │
│   ├── server.js            # Main Express server
│   ├── package.json         # Node.js dependencies
│   └── .env.example         # Environment variables template
│
├── 📂 frontend/
│   ├── index.html           # Homepage
│   ├── style.css            # Main stylesheet (770+ lines)
│   ├── script.js            # Main JavaScript
│   │
│   ├── 📂 js/
│   │   ├── products.js      # Products module with data
│   │   ├── cart.js          # Shopping cart functionality
│   │   ├── auth.js          # Authentication module
│   │   └── admin.js         # Admin dashboard module
│   │
│   ├── 📂 pages/
│   │   ├── products.html    # Products catalog
│   │   ├── cart.html        # Shopping cart
│   │   ├── checkout.html    # Checkout process
│   │   ├── login.html       # User login
│   │   ├── register.html    # User registration
│   │   ├── dashboard.html   # User account dashboard
│   │   ├── admin.html       # Admin control panel
│   │   └── track-order.html # Order tracking page
│   │
│   └── 📂 images/           # Product images
│
└── README.md                # Project documentation
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Step-by-Step Setup

1. **Navigate to backend folder**
   ```bash
   cd E-Commerce/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   copy .env.example .env
   ```

4. **Configure .env file**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/shopease
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d
   ```

5. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

6. **Run the server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:5000
   ```

---

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/updateprofile` | Update user profile |
| POST | `/api/auth/logout` | Logout user |

### 📦 Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products/categories` | Get all categories |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### 🛍️ Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders (Admin) |
| GET | `/api/orders/my-orders` | Get user's orders |
| GET | `/api/orders/:id` | Get order details |
| GET | `/api/orders/track/:orderNumber` | Track order status |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/status` | Update order status |
| PUT | `/api/orders/:id/cancel` | Cancel order |

### 👑 Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard overview |
| GET | `/api/admin/analytics/sales` | Get sales analytics |
| GET | `/api/admin/analytics/products` | Get product analytics |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |

---

## 🎨 Design System

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary | `#667eea` | Buttons, links, accents |
| Secondary | `#764ba2` | Gradients, hover states |
| Accent | `#f56565` | Alerts, notifications |
| Success | `#48bb78` | Success messages |
| Warning | `#ed8936` | Warning states |
| Dark | `#2d3748` | Text, headings |
| Light | `#f7fafc` | Backgrounds |

### Typography

- **Headings**: Montserrat (800, 900 weights)
- **Body**: Poppins (300-700 weights)

---

## 📸 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Hero, categories, featured products |
| Products | `/products` | Product catalog with filters |
| Cart | `/cart` | Shopping cart management |
| Checkout | `/checkout` | Multi-step checkout |
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |
| Dashboard | `/dashboard` | User account management |
| Admin | `/admin` | Admin control panel |
| Track Order | `/track-order` | Order status tracking |

---

## 📝 Database Models

### User Schema
```javascript
{
  firstName, lastName, email, password,
  phone, avatar, address,
  role: ['customer', 'admin', 'moderator'],
  wishlist, lastLogin, isActive, isVerified
}
```

### Product Schema
```javascript
{
  name, slug, description, price, originalPrice,
  category, brand, tags,
  stock, sku, inStock,
  images, icon, features, specifications,
  rating: { average, count }, reviews,
  isFeatured, isActive
}
```

### Order Schema
```javascript
{
  orderNumber, user, customerEmail,
  items: [{ product, name, price, quantity }],
  subtotal, tax, shippingCost, discount, total,
  shippingAddress, billingAddress,
  paymentMethod, paymentStatus,
  status, statusHistory,
  trackingNumber, carrier
}
```

---

## 👨‍💻 Author

**Your Name**  
Semester Project - 2024

---

## 📄 License

This project is created for educational purposes as part of a semester project submission.

---

<div align="center">

⭐ **Thank you for reviewing this project!** ⭐

Made with ❤️ using Node.js & MongoDB

</div>