const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Wishlist = require('./models/Wishlist');

// Backup directory
const backupDir = path.join(__dirname, 'database-backup');

// Function to restore data from backup files
async function restoreFromBackup() {
    console.log('🔄 Starting database restore from backup files...\n');

    try {
        // Check if backup directory exists
        if (!fs.existsSync(backupDir)) {
            console.error('❌ Backup directory not found:', backupDir);
            console.log('💡 Please run migrate-database.js first to create a backup.');
            process.exit(1);
        }

        // Read complete backup file
        const backupPath = path.join(backupDir, 'complete-backup.json');
        if (!fs.existsSync(backupPath)) {
            console.error('❌ Backup file not found:', backupPath);
            process.exit(1);
        }

        console.log('📂 Reading backup file...');
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Restore all collections
        const collections = [
            { name: 'users', model: User },
            { name: 'products', model: Product },
            { name: 'orders', model: Order },
            { name: 'reviews', model: Review },
            { name: 'wishlists', model: Wishlist }
        ];

        for (const collection of collections) {
            console.log(`📝 Restoring ${collection.name}...`);

            if (backupData[collection.name] && backupData[collection.name].length > 0) {
                // Clear existing data
                const deleteResult = await collection.model.deleteMany({});
                console.log(`   🗑️  Deleted ${deleteResult.deletedCount} existing ${collection.name}`);

                // Insert backup data
                await collection.model.insertMany(backupData[collection.name]);
                console.log(`   ✅ Restored ${backupData[collection.name].length} ${collection.name}`);
            } else {
                console.log(`   ⚠️  No ${collection.name} found in backup`);
            }
        }

        console.log('\n✅ Database restored successfully!');
        console.log('📊 Restore Summary:');
        console.log(`   - Users: ${backupData.users?.length || 0}`);
        console.log(`   - Products: ${backupData.products?.length || 0}`);
        console.log(`   - Orders: ${backupData.orders?.length || 0}`);
        console.log(`   - Reviews: ${backupData.reviews?.length || 0}`);
        console.log(`   - Wishlists: ${backupData.wishlists?.length || 0}`);

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from database');

    } catch (error) {
        console.error('\n❌ Restore failed:', error);
        process.exit(1);
    }
}

// Run restore
restoreFromBackup();
