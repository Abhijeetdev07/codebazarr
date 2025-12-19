const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a banner title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot be more than 200 characters'],
    default: ''
  },
  image: {
    type: String,
    required: [true, 'Please provide a banner image'],
    trim: true
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for sorting banners by order
bannerSchema.index({ order: 1, createdAt: -1 });

// Static method to get active banners sorted by order
bannerSchema.statics.getActiveBanners = async function () {
  return await this.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .select('-__v');
};

// Method to toggle active status
bannerSchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.save();
};

module.exports = mongoose.model('Banner', bannerSchema);
