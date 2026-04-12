import mongoose from "mongoose";

const shareholderSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  equityOwned: {
    type: Number,
    required: true,
  },
  investmentAmount: {
    type: Number,
    required: true,
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Shareholder", shareholderSchema);
