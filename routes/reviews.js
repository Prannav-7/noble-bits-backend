const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Add a review for a product
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { product, rating, comment } = req.body;

        // Validation
        if (!product || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide product, rating, and comment'
            });
        }

        // Check if user has purchased this product (Delivered order only)
        const Order = require('../models/Order');
        const hasPurchased = await Order.findOne({
            user: req.userId,
            'items.product': product,
            orderStatus: 'Delivered'
        });

        if (!hasPurchased) {
            return res.status(403).json({
                success: false,
                message: 'You can only review products you have purchased and received'
            });
        }

        // Create review
        const review = new Review({
            product,
            user: req.userId,
            userName: req.user.name,
            rating,
            comment,
            isVerifiedPurchase: true  // Mark as verified since we checked delivered order
        });

        await review.save();

        // Try to update product rating in database (only if product exists in MongoDB)
        try {
            const productExists = await Product.findById(product);
            if (productExists) {
                const reviews = await Review.find({ product });
                const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

                productExists.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
                productExists.reviewCount = reviews.length;
                await productExists.save();
            }
        } catch (productError) {
            // Product doesn't exist in MongoDB (using static products) - that's okay
            console.log('Product not in database (using static products)');
        }

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review',
            error: error.message
        });
    }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
    try {
        // Handle both numeric and ObjectId formats
        const productId = req.params.productId;

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
});

// @route   GET /api/reviews/can-review/:productId
// @desc    Check if user can review a product
// @access  Private
router.get('/can-review/:productId', auth, async (req, res) => {
    try {
        const Order = require('../models/Order');

        // Check if user has ANY order with this product
        const hasOrdered = await Order.findOne({
            user: req.userId,
            'items.product': req.params.productId
        });

        // Check if user has a delivered order with this product
        const hasDeliveredOrder = await Order.findOne({
            user: req.userId,
            'items.product': req.params.productId,
            orderStatus: 'Delivered'
        });

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            user: req.userId,
            product: req.params.productId
        });

        res.json({
            success: true,
            canReview: !!hasDeliveredOrder && !existingReview,
            hasPurchased: !!hasDeliveredOrder,  // Only true if delivered
            hasOrdered: !!hasOrdered,           // True for any order status
            hasReviewed: !!existingReview
        });
    } catch (error) {
        console.error('Can review check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking review eligibility',
            error: error.message
        });
    }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews by a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId })
            .populate('product', 'name image')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review or is admin
        if (review.user.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const productId = review.product;
        await review.deleteOne();

        // Recalculate product rating
        const reviews = await Review.find({ product: productId });
        const product = await Product.findById(productId);

        if (reviews.length > 0) {
            const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            product.rating = Math.round(avgRating * 10) / 10;
        } else {
            product.rating = 0;
        }

        product.reviewCount = reviews.length;
        await product.save();

        res.json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message
        });
    }
});

module.exports = router;
