import mongoose from "mongoose";

const fundingSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    backer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMethod: {
      type: String,
      enum: ["mobile_money", "card", "crypto", "bank"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Funding = mongoose.model("Funding", fundingSchema);
export default Funding;
