const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  razorpayOrderId: {
    type: String,
    required: [true, 'Razorpay order ID is required'],
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed'],
      message: 'Status must be either pending, completed, or failed'
    },
    default: 'pending'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
orderSchema.index({ userId: 1, purchaseDate: -1 });
orderSchema.index({ razorpayPaymentId: 1 });

// Method to check if user already owns this project
orderSchema.statics.hasUserPurchased = async function(userId, projectId) {
  const order = await this.findOne({
    userId,
    projectId,
    status: 'completed'
  });
  return !!order;
};

// Virtual to populate user and project details
orderSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

orderSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included when converting to JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
