import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema({
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal",
    required: true,
  },

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

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  currency: {
    type: String,
    default: "XAF",
  },

  status: {
    type: String,
    enum: ["holding", "ready_for_release", "released", "refunded"],
    default: "holding",
  },

  agreement: {
    documentUrl: String, // generated agreement template

    investorSignedUrl: String,
    investorSigned: { type: Boolean, default: false },
    investorSignedAt: Date,

    creatorSignedUrl: String,
    creatorSigned: { type: Boolean, default: false },
    creatorSignedAt: Date,

    adminValidated: { type: Boolean, default: false },
    adminValidatedAt: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  // ← add ready_for_release to your status enum


  releasedAt: Date,
  refundedAt: Date,

}, { timestamps: true });

export default mongoose.model("Escrow", escrowSchema);