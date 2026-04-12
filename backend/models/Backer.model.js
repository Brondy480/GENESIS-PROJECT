import mongoose from 'mongoose';
import Users from './Users.model.js';

const backerSchema = new mongoose.Schema({
  // 🪪 Identity & Verification
  idCardUrl: { type: String, required: false }, 
  occupation: { type: String },
  preferredCategories: [String],
  profileCompleted: { type: Boolean, default: false },

  // 💰 Investment Data
  backedProjects: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
      amountContributed: { type: Number, required: true },
      dateContributed: { type: Date, default: Date.now },
      rewardTier: { type: String },
      ownershipPercentage: { type: Number, default: 0 },
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    },
  ],
  totalContributed: { type: Number, default: 0 },
  backedProjectsCount: { type: Number, default: 0 },
});

const Backer = Users.discriminator('backer', backerSchema);
export default Backer;
