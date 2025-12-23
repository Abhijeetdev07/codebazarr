const dotenv = require('dotenv');

dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
    process.exit(1);
}

console.log('⚠️ Admin authentication is env-only. This script no longer creates an admin user in MongoDB.');
console.log('\n🔑 Admin Login Credentials (from env):');
console.log(`   Email: ${adminEmail}`);
console.log(`   Password: ${adminPassword}`);
console.log('\n✨ You can now log in to the admin panel (no admin user will be stored in DB).\n');
