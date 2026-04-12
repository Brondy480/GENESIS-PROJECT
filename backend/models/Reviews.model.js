import mongoose from 'mongoose';

const projectReviewSchema = new mongoose.Schema({
  reviewId: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  reviewText: String,
}, { timestamps: true });

const ProjectReview = mongoose.model('ProjectReview', projectReviewSchema);

export default ProjectReview;
