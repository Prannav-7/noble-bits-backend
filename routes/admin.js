const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Middleware to check if user has admin rights based on email
const checkAdminEmail = (req, res, next) => {
    const adminEmails = ['prannavp803@gmail.com', 'ran17062005@gmail.com'];

    if (!adminEmails.includes(req.user.email)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have admin privileges.'
        });
    }
    next();
};

// Apply auth and admin checks to all routes
router.use(auth);
router.use(checkAdminEmail);

// ==================== PRODUCT MANAGEMENT ====================

// Get all products with pagination
router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', category = '' } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const products = await Product.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalProducts: count
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// Create new product
router.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

// ==================== ANALYTICS & DASHBOARD ====================

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Get pending orders count
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

        // Get low stock products
        const lowStockProducts = await Product.countDocuments({ stockQuantity: { $lt: 10 } });

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalProducts,
                totalUsers,
                totalRevenue,
                pendingOrders,
                lowStockProducts
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
});

// Get sales by category (for pie chart)
router.get('/analytics/sales-by-category', async (req, res) => {
    try {
        const salesByCategory = await Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$productInfo.category',
                    totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: salesByCategory
        });
    } catch (error) {
        console.error('Sales by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales by category',
            error: error.message
        });
    }
});

// Get sales by payment method (for pie chart)
router.get('/analytics/sales-by-payment', async (req, res) => {
    try {
        const salesByPayment = await Order.aggregate([
            {
                $group: {
                    _id: '$paymentMethod',
                    totalSales: { $sum: '$finalAmount' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: salesByPayment
        });
    } catch (error) {
        console.error('Sales by payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales by payment method',
            error: error.message
        });
    }
});

// Get order status distribution (for pie chart)
router.get('/analytics/order-status', async (req, res) => {
    try {
        const orderStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: orderStatus
        });
    } catch (error) {
        console.error('Order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order status distribution',
            error: error.message
        });
    }
});

// Get monthly sales (for line/bar chart)
router.get('/analytics/monthly-sales', async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalSales: { $sum: '$finalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Fill in missing months with zero
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const fullYearData = monthNames.map((month, index) => {
            const monthData = monthlySales.find(m => m._id === index + 1);
            return {
                month,
                totalSales: monthData ? monthData.totalSales : 0,
                orderCount: monthData ? monthData.orderCount : 0
            };
        });

        res.json({
            success: true,
            data: fullYearData
        });
    } catch (error) {
        console.error('Monthly sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly sales',
            error: error.message
        });
    }
});

// Get weekly sales (last 12 weeks)
router.get('/analytics/weekly-sales', async (req, res) => {
    try {
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks

        const weeklySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveWeeksAgo }
                }
            },
            {
                $group: {
                    _id: { $week: '$createdAt' },
                    totalSales: { $sum: '$finalAmount' },
                    orderCount: { $sum: 1 },
                    weekStart: { $min: '$createdAt' }
                }
            },
            { $sort: { 'weekStart': 1 } }
        ]);

        res.json({
            success: true,
            data: weeklySales
        });
    } catch (error) {
        console.error('Weekly sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weekly sales',
            error: error.message
        });
    }
});

// Get recent orders
router.get('/orders/recent', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Recent orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent orders',
            error: error.message
        });
    }
});

// Get all orders with filters
router.get('/orders', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = '', search = '' } = req.query;

        const query = {};
        if (status) {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalOrders: count
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// Get order history for a specific user
router.get('/orders/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('User order history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user order history',
            error: error.message
        });
    }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { orderStatus, trackingNumber } = req.body;

        const updateData = { orderStatus };
        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }
        if (orderStatus === 'Delivered') {
            updateData.deliveredAt = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

// Get top selling products
router.get('/analytics/top-products', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top products',
            error: error.message
        });
    }
});

module.exports = router;
