const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function verifyMigration() {
    console.log('🔍 Verifying database migration...\n');

    try {
        // Connect to new database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to new database\n');

        // Get database stats
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('📊 Database Collections:\n');

        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`   ${collection.name}: ${count} documents`);
        }

        console.log('\n📈 Detailed Statistics:\n');

        // Get sample documents from each collection
        const collectionNames = ['users', 'products', 'orders', 'reviews', 'wishlists'];

        for (const name of collectionNames) {
            try {
                const count = await db.collection(name).countDocuments();
                const sample = await db.collection(name).findOne({});

                console.log(`${name.toUpperCase()}:`);
                console.log(`   Total: ${count}`);
                if (sample) {
                    console.log(`   Sample ID: ${sample._id}`);
                    if (sample.name) console.log(`   Sample Name: ${sample.name}`);
                    if (sample.email) console.log(`   Sample Email: ${sample.email}`);
                }
                console.log('');
            } catch (error) {
                console.log(`${name.toUpperCase()}: Collection not found or empty\n`);
            }
        }

        console.log('✅ Verification completed!\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verifyMigration();
