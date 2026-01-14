const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: String,  // Changed from ObjectId to String to support both numeric and MongoDB IDs
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: [true, 'Please provide a review comment'],
        trim: true,
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false,
    },
    helpful: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent duplicate reviews from same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
