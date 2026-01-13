const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0,
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['Savory', 'Sweet'],
    },
    image: {
        type: String,
        required: [true, 'Please provide product image'],
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
    },
    ingredients: {
        type: String,
        required: [true, 'Please provide ingredients'],
    },
    shelfLife: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
    stockQuantity: {
        type: Number,
        default: 100,
        min: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp before saving
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
