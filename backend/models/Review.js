const mongoose = require('mongoose');

require('./Project');

const reviewSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const syncProjectRating = async (reviewDoc) => {
  try {
    if (!reviewDoc?.projectId) return;
    const Project = mongoose.model('Project');
    await Project.recalculateRating(reviewDoc.projectId);
  } catch (error) {
    console.error('Error syncing project rating:', error);
  }
};

reviewSchema.post('save', async function(doc) {
  await syncProjectRating(doc);
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await syncProjectRating(doc);
    return;
  }

  const found = await this.model.findOne(this.getQuery());
  await syncProjectRating(found);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  await syncProjectRating(doc);
});

module.exports = mongoose.model('Review', reviewSchema);
