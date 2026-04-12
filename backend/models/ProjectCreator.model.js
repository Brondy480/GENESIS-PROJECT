import mongoose from 'mongoose';
import Users from './Users.model.js';

const creatorSchema = new mongoose.Schema({
  // 🪪 Identity & Verification
  idCardUrl: { type: String, required: false },
  proofOfAddressUrl: { type: String, required: false },
  profileCompleted: { type: Boolean, default: false },

  // 📝 Profile Info
  bio: { type: String },
  skills: [String],
  portfolioUrl: String,
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    website: String,
  }, 

  // 💰 Performance Metrics
  totalProjects: { type: Number, default: 0 },
  totalFundsRaised: { type: Number, default: 0 },

  // 🔹 Project References (optional but useful)
  projects: [
    { 
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      createdAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['draft', 'active', 'completed', 'funded'], default: 'draft' },
    },
  ],

  // 🔹 Communication / Messaging (optional)
  conversations: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      conversationId: String,
    },
  ],
});

const Creator = Users.discriminator('creator', creatorSchema);
export default Creator;
