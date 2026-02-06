const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

async function promoteToAdmin() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Get email from command line argument
        const email = process.argv[2];

        if (!email) {
            console.log('❌ Please provide an email address');
            console.log('Usage: node promote-admin.js <email>');
            console.log('\nExample: node promote-admin.js ran17062005@gmail.com\n');

            // List all users
            console.log('📋 Available users:\n');
            const users = await User.find({}, 'name email role');
            users.forEach(user => {
                console.log(`   ${user.email} - ${user.name} (${user.role})`);
            });

            await mongoose.disconnect();
            process.exit(1);
        }

        // Find and update user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`❌ User not found with email: ${email}`);
            console.log('\n📋 Available users:\n');
            const users = await User.find({}, 'name email role');
            users.forEach(u => {
                console.log(`   ${u.email} - ${u.name} (${u.role})`);
            });
            await mongoose.disconnect();
            process.exit(1);
        }

        // Update role to admin
        user.role = 'admin';
        await user.save();

        console.log('✅ User promoted to admin successfully!\n');
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   User ID: ${user._id}\n`);

        await mongoose.disconnect();
        console.log('✅ Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

promoteToAdmin();
