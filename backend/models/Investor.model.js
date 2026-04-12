import mongoose from 'mongoose';
import Users from './Users.model.js';

const investorSchema = new mongoose.Schema({
  // 🪪 Identity & Verification
  companyName: { type: String },
  idCardUrl: { type: String, required: false },
  proofOfFundsUrl: { type: String, required: false },
  proofOfAddressUrl: { type: String, required: false },
  profileCompleted: { type: Boolean, default: false },

  // 💰 Investment Preferences
  investmentFocus: [String],
  averageInvestmentSize: { type: Number },
  investmentLimit: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },

  // 🔹 Investment History
  investments: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      amount: { type: Number, required: true },
      equityOwned: { type: Number, default: 0 },
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
      dateInvested: { type: Date, default: Date.now },
    },
  ],

  // 🔹 Investment Requests
  investmentRequests: [
    {
      requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentRequest' },
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      amount: { type: Number },
      proposedEquity: { type: Number },
      status: { type: String, enum: ['pending','approved','rejected'], default:'pending' },
    },
  ],

  // 🔹 Messaging
  conversations: [
    {
      creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      conversationId: String,
    },
  ],

  // 🔹 Permissions (if admin-like features needed)
  permissions: [String],
});

const Investor = Users.discriminator('investor', investorSchema);
export default Investor;
