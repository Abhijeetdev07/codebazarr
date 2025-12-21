const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  avgRating: {
    type: Number,
    min: [0, 'Average rating cannot be negative'],
    max: [5, 'Average rating cannot be more than 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  demoUrl: {
    type: String,
    trim: true,
    default: ''
  },
  sourceCodeUrl: {
    type: String,
    trim: true,
    default: ''
  },
  technologies: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

projectSchema.statics.recalculateRating = async function(projectId) {
  const Review = mongoose.model('Review');

  const stats = await Review.aggregate([
    { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
    {
      $group: {
        _id: '$projectId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const update = stats.length
    ? {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].reviewCount
      }
    : { avgRating: 0, reviewCount: 0 };

  await this.findByIdAndUpdate(projectId, update, { new: false });
};

// Update the updatedAt timestamp before updating
projectSchema.pre('findOneAndUpdate', async function() {
  this.set({ updatedAt: Date.now() });
});

// Virtual for formatted price
projectSchema.virtual('formattedPrice').get(function() {
  const price = typeof this.price === 'number' ? this.price : 0;
  return `$${price.toFixed(2)}`;
});

// Ensure virtuals are included when converting to JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
