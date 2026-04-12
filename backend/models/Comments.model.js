import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  commentId: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  commentText: String,
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
