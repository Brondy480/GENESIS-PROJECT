import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: String,
  relatedDeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  balance: {
    type: Number,
    default: 0,
  },
  escrowBalance: {
    type: Number,
    default: 0,
  },
  transactions: [transactionSchema],
});

export default mongoose.model("Wallet", walletSchema);
