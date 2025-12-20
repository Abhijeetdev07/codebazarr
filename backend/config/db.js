const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    try {
      await conn.connection.db.collection('orders').dropIndex('stripePaymentId_1');
    } catch (e) {
      // ignore if index doesn't exist or cannot be dropped
    }

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
