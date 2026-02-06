# Noble Bites Backend API 🍰

Backend API for Noble Bites - Traditional Snacks E-commerce Platform

**Last Updated:** February 6, 2026  
**Status:** ✅ Production Ready  
**Database:** MongoDB Atlas (cluster0.9xaehox.mongodb.net)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
The `.env` file is already configured with:
- MongoDB connection string
- JWT secret
- Port configuration

### 3. Seed Database with Products
```bash
node seed.js
```

### 4. Start Development Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── models/           # MongoDB schemas
│   ├── User.js      # User authentication & profiles
│   ├── Product.js   # Product catalog
│   ├── Order.js     # Order management
│   ├── Review.js    # Product reviews
│   └── Wishlist.js  # User wishlists
├── routes/          # API endpoints
│   ├── auth.js      # Authentication routes
│   ├── products.js  # Product CRUD
│   ├── orders.js    # Order management
│   ├── reviews.js   # Review system
│   ├── wishlist.js  # Wishlist operations
│   └── users.js     # User profile management
├── middleware/      # Custom middleware
│   └── auth.js      # JWT authentication
├── .env            # Environment variables
├── server.js       # Main application file
├── seed.js         # Database seeding script
└── package.json    # Dependencies
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (requires auth)

### Products (`/api/products`)
- `GET /` - Get all products (supports filters: category, search, sort)
- `GET /:id` - Get single product
- `POST /` - Create product (admin only)
- `PUT /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)

### Orders (`/api/orders`)
- `POST /` - Create new order (requires auth)
- `GET /user/:userId` - Get user's orders (requires auth)
- `GET /:id` - Get single order (requires auth)
- `PUT /:id/status` - Update order status (admin)
- `GET /` - Get all orders (admin)

### Reviews (`/api/reviews`)
- `POST /` - Add review (requires auth)
- `GET /product/:productId` - Get product reviews
- `GET /user/:userId` - Get user reviews
- `DELETE /:id` - Delete review (requires auth)

### Wishlist (`/api/wishlist`)
- `GET /:userId` - Get user wishlist (requires auth)
- `POST /` - Add item to wishlist (requires auth)
- `DELETE /:userId/:productId` - Remove from wishlist (requires auth)
- `DELETE /:userId` - Clear wishlist (requires auth)

### Users (`/api/users`)
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update profile (requires auth)
- `PUT /change-password` - Change password (requires auth)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Collections

**Current Database Status (Verified):**
- **users** - 12 user accounts (including admin)
- **products** - 16 traditional snacks and sweets
- **orders** - 20 customer orders
- **reviews** - 3 product reviews
- **wishlists** - Active wishlist data

**Last Migration:** February 6, 2026

## 🛠️ Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string_here
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

**Note:** Connection string is configured in `.env` file (not in git for security)

## 🧪 Testing the API

### Test with cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Get all products:**
```bash
curl http://localhost:5000/api/products
```

### Test with Postman or Thunder Client

Import the endpoints and test all functionality with proper request bodies.

## 📦 Data Models

### User Schema
- name, email, password (hashed)
- phone, address (street, city, state, pincode, country)
- role (user/admin), isActive, timestamps

### Product Schema
- name, price, category (Savory/Sweet)
- image, description, ingredients
- shelfLife, weight, rating, reviewCount
- inStock, stockQuantity, featured
- timestamps

### Order Schema
- user reference, items array
- shippingAddress, paymentMethod
- totalAmount, tax, shippingCharges, finalAmount
- orderStatus, paymentStatus
- trackingNumber, deliveredAt
- timestamps

### Review Schema
- product reference, user reference
- rating (1-5), comment
- isVerifiedPurchase, helpful count
- timestamps

### Wishlist Schema
- user reference (unique)
- items array with product references
- timestamps

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes with middleware
- Role-based access control
- Input validation
- Unique constraints on critical fields

## 📈 Next Steps

1. ✅ Backend API is ready
2. Connect your frontend to these endpoints
3. Update frontend API calls to use `http://localhost:5000`
4. Test all functionality end-to-end
5. Deploy to production (Render, Railway, etc.)

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
- Verify MongoDB Atlas IP whitelist includes your IP
- Check connection string is correct
- Ensure internet connection is stable

**Authentication Errors:**
- Verify JWT_SECRET is set correctly
- Check token format in Authorization header
- Ensure user is logged in and token is valid

**CORS Errors:**
- CORS is enabled for all origins in development
- Configure specific origins in production

## 📞 Support

For issues or questions, check the connection to MongoDB Atlas and ensure all dependencies are installed correctly.

---

**Author:** Noble Bite Team
**Version:** 1.0.0
**License:** ISC
