const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, totalAmount, tax, shippingCharges, finalAmount } = req.body;

        console.log('=== Order Creation Request ===');
        console.log('User ID:', req.userId);
        console.log('Items:', JSON.stringify(items, null, 2));
        console.log('Shipping Address:', JSON.stringify(shippingAddress, null, 2));
        console.log('Payment Method:', paymentMethod);
        console.log('Total Amount:', totalAmount);
        console.log('Tax:', tax);
        console.log('Shipping Charges:', shippingCharges);
        console.log('Final Amount:', finalAmount);

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in the order'
            });
        }

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address and payment method are required'
            });
        }

        // Check and reduce stock for each product
        const Product = require('../models/Product');

        for (const item of items) {
            try {
                // Try to find product in MongoDB
                const product = await Product.findById(item.product);

                if (product) {
                    // Check if enough stock is available
                    if (product.stockQuantity < item.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Insufficient stock for ${product.name}. Only ${product.stockQuantity} units available.`
                        });
                    }

                    // Reduce stock quantity
                    product.stockQuantity -= item.quantity;

                    // Update inStock status
                    if (product.stockQuantity === 0) {
                        product.inStock = false;
                    }

                    await product.save();
                    console.log(`Stock reduced for ${product.name}: ${product.stockQuantity} remaining`);
                }
            } catch (productError) {
                // Product not in MongoDB (using static products) - that's okay
                console.log(`Product ${item.product} not in database (using static products)`);
            }
        }

        // Calculate final amount if not provided
        const calculatedFinalAmount = finalAmount || (totalAmount + (tax || 0) + (shippingCharges || 0));

        // Create order
        const order = new Order({
            user: req.userId,
            items,
            shippingAddress,
            paymentMethod,
            totalAmount,
            tax: tax || 0,
            shippingCharges: shippingCharges || 0,
            finalAmount: calculatedFinalAmount,
            paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
        });

        console.log('Attempting to save order...');
        await order.save();
        console.log('Order saved successfully!');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order,
        });
    } catch (error) {
        console.error('=== Create Order Error ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your orders',
            error: error.message
        });
    }
});

// @route   GET /api/orders/user/:userId
// @desc    Get all orders for a user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
    try {
        // Check if user is requesting their own orders
        if (req.userId !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const orders = await Order.find({ user: req.params.userId })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { orderStatus, trackingNumber } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (orderStatus) {
            order.orderStatus = orderStatus;
            if (orderStatus === 'Delivered') {
                order.deliveredAt = Date.now();
                order.paymentStatus = 'Completed';
            }
        }

        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order,
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
    try {
        // This route should be admin-protected in production
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

module.exports = router;
