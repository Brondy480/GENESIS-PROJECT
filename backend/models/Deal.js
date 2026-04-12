import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    //////////////////////////////////////////////////
    // RELATIONS
    //////////////////////////////////////////////////

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    investmentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentRequest",
    },

    //////////////////////////////////////////////////
    // FINAL AGREED TERMS (IMMUTABLE AFTER CREATION)
    //////////////////////////////////////////////////

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    equity: {
      type: Number, // percentage
      required: true,
      min: 0,
      max: 100,
    },

    valuationAtInvestment: {
      type: Number,
    },

    //////////////////////////////////////////////////
    // PAYMENT
    //////////////////////////////////////////////////

    payment: {
      provider: {
        type: String, // flutterwave, stripe
      },

      txRef: String,

      transactionId: String,

      status: {
        type: String,
        enum: [
          "awaiting_payment",
          "processing",
          "paid",
          "failed",
          "refunded"
        ],
        default: "awaiting_payment",
      },

      paidAt: Date,
    },

    //////////////////////////////////////////////////
    // ESCROW
    //////////////////////////////////////////////////

    escrow: {
      escrowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Escrow",
      },

      status: {
        type: String,
        enum: ["holding", "released", "cancelled"],
        default: "holding",
      },

      releasedAt: Date,
    },

    //////////////////////////////////////////////////
    // LEGAL AGREEMENT
    //////////////////////////////////////////////////

    agreement: {
      fileUrl: String,

      signedByInvestor: {
        type: Boolean,
        default: false,
      },

      signedByCreator: {
        type: Boolean,
        default: false,
      },

      signedAt: Date,
    },

    //////////////////////////////////////////////////
    // DEAL LIFECYCLE
    //////////////////////////////////////////////////

    dealStatus: {
      type: String,
      enum: [
        "created",            // deal created after acceptance
        "awaiting_payment",
        "payment_completed",
        "awaiting_signatures",
        "active",             // equity officially active
        "cancelled"
      ],
      default: "created",
      index: true,
    },

    //////////////////////////////////////////////////
    // PLATFORM META
    //////////////////////////////////////////////////

    platformFeePercent: {
      type: Number,
      default: 5,
    },

    platformFeeAmount: Number,

  },
  { timestamps: true }
);

export default mongoose.model("Deal", dealSchema);
