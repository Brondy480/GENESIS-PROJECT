import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentMode: {
      type: String,
      default: "mvp",
    },
    transactionReference: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);