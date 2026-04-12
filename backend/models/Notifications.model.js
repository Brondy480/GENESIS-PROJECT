import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "agreement_signing_required",
        "agreement_signed",
        "escrow_released",
        "deal_completed",
        "investment_received",
        "payment_confirmed",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    data: {
      // flexible metadata (dealId, escrowId, projectId etc)
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);