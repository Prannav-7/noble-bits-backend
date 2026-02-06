const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Database connection strings
const OLD_DB = 'mongodb+srv://prannavp803_db_user:mtVnZZ9smGHAB7HS@cluster0.gprfdbn.mongodb.net/noblebits?retryWrites=true&w=majority';
const NEW_DB = process.env.MONGODB_URI;

// Create backup directory
const backupDir = path.join(__dirname, 'database-backup');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Function to export data from old database
async function exportData() {
    console.log('📦 Starting data export from old database...');

    try {
        // Connect to old database
        const oldConn = await mongoose.createConnection(OLD_DB).asPromise();
        console.log('✅ Connected to old database');

        // Get all collection names
        const collections = await oldConn.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`📂 Found ${collectionNames.length} collections:`, collectionNames.join(', '));

        const exportedData = {};

        for (const collectionName of collectionNames) {
            console.log(`📝 Exporting ${collectionName}...`);
            const data = await oldConn.db.collection(collectionName).find({}).toArray();
            exportedData[collectionName] = data;
            console.log(`   ✅ Exported ${data.length} documents from ${collectionName}`);

            // Save to individual JSON files
            const filePath = path.join(backupDir, `${collectionName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }

        // Save complete backup
        const completePath = path.join(backupDir, 'complete-backup.json');
        fs.writeFileSync(completePath, JSON.stringify(exportedData, null, 2));

        // Create metadata file
        const metadata = {
            exportDate: new Date().toISOString(),
            sourceDatabase: OLD_DB.split('@')[1].split('/')[0],
            collections: collectionNames,
            totalDocuments: Object.values(exportedData).reduce((sum, coll) => sum + coll.length, 0)
        };
        const metadataPath = path.join(backupDir, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        console.log(`\n✅ Data exported successfully to: ${backupDir}`);
        console.log('📊 Export Summary:');
        for (const [name, data] of Object.entries(exportedData)) {
            console.log(`   - ${name}: ${data.length} documents`);
        }

        await oldConn.close();
        console.log('✅ Disconnected from old database\n');

        return exportedData;
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        throw error;
    }
}

// Function to import data to new database
async function importData(data) {
    console.log('📥 Starting data import to new database...');

    try {
        // Connect to new database
        const newConn = await mongoose.createConnection(NEW_DB).asPromise();
        console.log('✅ Connected to new database');

        for (const [collectionName, documents] of Object.entries(data)) {
            console.log(`📝 Importing ${collectionName}...`);

            if (documents && documents.length > 0) {
                try {
                    // Clear existing data in the collection
                    await newConn.db.collection(collectionName).deleteMany({});
                    console.log(`   🗑️  Cleared existing ${collectionName}`);

                    // Insert documents directly using the native MongoDB driver
                    // This bypasses Mongoose validation and pre-save hooks
                    const result = await newConn.db.collection(collectionName).insertMany(documents, {
                        ordered: false
                    });
                    console.log(`   ✅ Imported ${result.insertedCount} documents to ${collectionName}`);
                } catch (error) {
                    console.error(`   ❌ Error importing ${collectionName}:`, error.message);
                }
            } else {
                console.log(`   ⚠️  No documents to import for ${collectionName}`);
            }
        }

        console.log('\n✅ Data imported successfully!');
        console.log('📊 Import Summary:');
        for (const [name, documents] of Object.entries(data)) {
            console.log(`   - ${name}: ${documents?.length || 0} documents`);
        }

        await newConn.close();
        console.log('✅ Disconnected from new database');

    } catch (error) {
        console.error('❌ Error importing data:', error);
        throw error;
    }
}

// Main migration function
async function migrateDatabase() {
    console.log('🚀 Starting database migration...\n');
    console.log('📍 Old Database:', OLD_DB.substring(0, 60) + '...');
    console.log('📍 New Database:', NEW_DB.substring(0, 60) + '...\n');

    try {
        // Step 1: Export data from old database
        const exportedData = await exportData();

        // Step 2: Import data to new database
        await importData(exportedData);

        console.log('\n🎉 Database migration completed successfully!');
        console.log(`📁 Backup files saved in: ${backupDir}`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateDatabase();
