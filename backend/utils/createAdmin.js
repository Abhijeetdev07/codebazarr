const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in .env file');
        }
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
            process.exit(1);
        }

        console.log(`\n🔍 Checking for admin: ${adminEmail}`);

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`\n📋 Admin user found:`);
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);

            if (existingAdmin.role !== 'admin') {
                console.log(`\n⚠️  User exists but role is '${existingAdmin.role}', updating to 'admin'...`);
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log(`✅ Role updated to 'admin'`);
            } else {
                console.log(`✅ Admin account is correctly configured`);
            }
        } else {
            console.log(`\n❌ Admin not found. Creating new admin...`);
            const newAdmin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log(`✅ Admin created successfully!`);
            console.log(`   Email: ${newAdmin.email}`);
            console.log(`   Role: ${newAdmin.role}`);
        }

        console.log(`\n🔑 Login Credentials:`);
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`\n✨ You can now log in to the admin panel!\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
