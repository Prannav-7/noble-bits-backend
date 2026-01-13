const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');

// @route   GET /api/wishlist/:userId
// @desc    Get user's wishlist
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        // Check if user is requesting their own wishlist
        if (req.userId !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.params.userId })
            .populate('items.product');

        if (!wishlist) {
            // Create empty wishlist if doesn't exist
            wishlist = new Wishlist({ user: req.params.userId, items: [] });
            await wishlist.save();
        }

        res.json({
            success: true,
            wishlist,
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist',
            error: error.message
        });
    }
});

// @route   POST /api/wishlist
// @desc    Add item to wishlist
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.userId });

        if (!wishlist) {
            // Create new wishlist
            wishlist = new Wishlist({
                user: req.userId,
                items: [{ product: productId }],
            });
        } else {
            // Check if product already in wishlist
            const itemExists = wishlist.items.some(
                item => item.product.toString() === productId
            );

            if (itemExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Product already in wishlist'
                });
            }

            // Add to wishlist
            wishlist.items.push({ product: productId });
        }

        await wishlist.save();
        await wishlist.populate('items.product');

        res.json({
            success: true,
            message: 'Product added to wishlist',
            wishlist,
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to wishlist',
            error: error.message
        });
    }
});

// @route   DELETE /api/wishlist/:userId/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/:userId/:productId', auth, async (req, res) => {
    try {
        const { userId, productId } = req.params;

        // Check if user is removing from their own wishlist
        if (req.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        // Remove item
        wishlist.items = wishlist.items.filter(
            item => item.product.toString() !== productId
        );

        await wishlist.save();
        await wishlist.populate('items.product');

        res.json({
            success: true,
            message: 'Product removed from wishlist',
            wishlist,
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from wishlist',
            error: error.message
        });
    }
});

// @route   DELETE /api/wishlist/:userId
// @desc    Clear entire wishlist
// @access  Private
router.delete('/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user is clearing their own wishlist
        if (req.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.items = [];
        await wishlist.save();

        res.json({
            success: true,
            message: 'Wishlist cleared successfully',
            wishlist,
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing wishlist',
            error: error.message
        });
    }
});

module.exports = router;
