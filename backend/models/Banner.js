const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a banner title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  image: {
    type: String,
    required: [true, 'Please provide a banner image'],
    trim: true
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

// Index for sorting banners by createdAt
bannerSchema.index({ createdAt: -1 });

// Static method to get active banners sorted by creation date
bannerSchema.statics.getActiveBanners = async function () {
  return await this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select('-__v');
};

// Method to toggle active status
bannerSchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.save();
};

module.exports = mongoose.model('Banner', bannerSchema);
