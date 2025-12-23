const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ Admin credentials not found in .env. usage: ADMIN_EMAIL & ADMIN_PASSWORD');
      return;
    }

    console.warn('⚠️ Skipping admin DB seeding. Admin authentication is env-only.');
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};

module.exports = seedAdmin;
