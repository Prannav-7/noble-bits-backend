# API Testing Guide

Your backend is running on **http://localhost:5000** ✅

## Quick Test Endpoints

### 1. Check Server Status
```bash
curl http://localhost:5000
```

Expected Response:
```json
{
  "message": "Welcome to Noble Bite API"
}
```

### 2. Get All Products
```bash
curl http://localhost:5000/api/products
```

This will return all 10 products from MongoDB!

### 3. Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"phone\":\"9876543210\"}"
```

### 4. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

You'll receive a JWT token - save it for authenticated requests!

### 5. Get User Profile (Requires Token)
```bash
curl http://localhost:5000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Create an Order (Requires Token)
```bash
curl -X POST http://localhost:5000/api/orders ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"items\":[{\"product\":\"PRODUCT_ID\",\"name\":\"Murukku\",\"price\":50,\"quantity\":2,\"image\":\"...\"}],\"shippingAddress\":{\"name\":\"John Doe\",\"phone\":\"9876543210\",\"street\":\"123 Main St\",\"city\":\"Chennai\",\"state\":\"Tamil Nadu\",\"pincode\":\"600001\"},\"paymentMethod\":\"Cash on Delivery\",\"totalAmount\":100,\"tax\":0,\"shippingCharges\":40}"
```

### 7. Add Product to Wishlist (Requires Token)
```bash
curl -X POST http://localhost:5000/api/wishlist ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"productId\":\"PRODUCT_ID_HERE\"}"
```

### 8. Add a Review (Requires Token)
```bash
curl -X POST http://localhost:5000/api/reviews ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"product\":\"PRODUCT_ID\",\"rating\":5,\"comment\":\"Absolutely delicious murukku!\"}"
```

## Testing with Browser

Open your browser and try these URLs:

1. **Server Status**: http://localhost:5000
2. **All Products**: http://localhost:5000/api/products
3. **Products by Category**: http://localhost:5000/api/products?category=Sweet
4. **Search Products**: http://localhost:5000/api/products?search=murukku

## Testing with Postman/Thunder Client

### Setup Collection

1. Create a new collection called "Noble Bite API"
2. Set base URL as variable: `{{baseUrl}}` = `http://localhost:5000`
3. Add these requests:

**Authentication:**
- POST `{{baseUrl}}/api/auth/register`
- POST `{{baseUrl}}/api/auth/login`
- GET `{{baseUrl}}/api/auth/me`

**Products:**
- GET `{{baseUrl}}/api/products`
- GET `{{baseUrl}}/api/products/:id`

**Orders:**
- POST `{{baseUrl}}/api/orders`
- GET `{{baseUrl}}/api/orders/user/:userId`

**Wishlist:**
- GET `{{baseUrl}}/api/wishlist/:userId`
- POST `{{baseUrl}}/api/wishlist`
- DELETE `{{baseUrl}}/api/wishlist/:userId/:productId`

**Reviews:**
- POST `{{baseUrl}}/api/reviews`
- GET `{{baseUrl}}/api/reviews/product/:productId`

## Current Database Status

✅ **MongoDB Collections:**
- **products**: 10 items (5 Savory, 5 Sweet)
- **users**: Empty (register users via API)
- **orders**: Empty (will populate when orders are placed)
- **reviews**: Empty (will populate when reviews are added)
- **wishlists**: Empty (will populate when users add to wishlist)

## What's Working

✅ Server running on port 5000
✅ MongoDB connected successfully
✅ All API routes configured
✅ Product data seeded
✅ Authentication with JWT
✅ Protected routes with middleware
✅ CORS enabled for frontend

## Next Steps

1. **Test the APIs** using the commands above
2. **Connect your frontend** to use these endpoints
3. **Create a test user** to verify authentication
4. **Place a test order** to verify order flow
5. **Add reviews and wishlist items** to test all features

## Viewing Your Data

Visit **MongoDB Atlas Dashboard**:
- URL: https://cloud.mongodb.com/
- Database: `noblebits`
- Collections: users, products, orders, reviews, wishlists

You can view all data in real-time as you test the APIs!

---

**Server URL**: http://localhost:5000
**Database**: MongoDB Atlas
**Status**: ✅ Running
