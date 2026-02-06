const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// IMPORTANT: Update this with your deployed backend URL after deployment
const OLD_URL = 'http://localhost:5000';
const NEW_URL = 'https://YOUR-BACKEND-URL.onrender.com'; // Replace with your actual deployed backend URL

async function updateImageUrls() {
    console.log('🚀 Starting image URL update...\n');
    console.log(`📍 Old URL: ${OLD_URL}`);
    console.log(`📍 New URL: ${NEW_URL}\n`);

    if (NEW_URL.includes('YOUR-BACKEND-URL')) {
        console.error('❌ ERROR: Please update the NEW_URL variable with your actual deployed backend URL!');
        console.error('   Open this file and change: https://YOUR-BACKEND-URL.onrender.com');
        console.error('   To your actual URL like: https://noble-bites-backend.onrender.com\n');
        process.exit(1);
    }

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all products
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products in database\n`);

        if (products.length === 0) {
            console.log('⚠️  No products found in database.');
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log('🔄 Updating product image URLs...\n');

        let updated = 0;
        let skipped = 0;

        for (const product of products) {
            if (product.image && product.image.includes(OLD_URL)) {
                const oldImage = product.image;
                product.image = product.image.replace(OLD_URL, NEW_URL);
                await product.save();
                updated++;
                console.log(`   ✅ Updated: ${product.name}`);
                console.log(`      Old: ${oldImage}`);
                console.log(`      New: ${product.image}\n`);
            } else {
                skipped++;
                console.log(`   ⏭️  Skipped: ${product.name} (already updated or no localhost URL)`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Update Summary:');
        console.log('='.repeat(60));
        console.log(`   Total Products: ${products.length}`);
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log('='.repeat(60) + '\n');

        if (updated > 0) {
            console.log('✅ Image URLs updated successfully!');
            console.log('📌 Next steps:');
            console.log('   1. Verify your backend is deployed and accessible');
            console.log('   2. Test image loading: ' + NEW_URL + '/uploads/products/');
            console.log('   3. Clear browser cache and test your production site\n');
        } else {
            console.log('ℹ️  No products needed updating.');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error updating image URLs:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   - Check MongoDB connection string in .env file');
        console.error('   - Ensure you have internet connection');
        console.error('   - Verify MongoDB Atlas allows connections from your IP\n');
        process.exit(1);
    }
}

// Display instructions before running
console.log('\n' + '='.repeat(60));
console.log('Image URL Update Script');
console.log('='.repeat(60));
console.log('This script will update all product image URLs from localhost');
console.log('to your deployed backend URL.');
console.log('='.repeat(60) + '\n');

updateImageUrls();
