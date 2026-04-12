import mongoose from "mongoose";

const investmentRequestSchema = new mongoose.Schema(
  {
    /* =====================================================
       RELATIONS
    ===================================================== */

    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    /* =====================================================
       ORIGINAL PROPOSAL
    ===================================================== */

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    equityRequested: {
      type: Number,
      required: true,
      min: 0.01,
      max: 100,
      set: (v) => Number(v),
    },

    message: String,

    /* =====================================================
       ADMIN VALIDATION
    ===================================================== */

    adminStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    adminReviewedAt: Date,

    /* =====================================================
       CREATOR DECISION
    ===================================================== */

    creatorStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "auto_rejected",
      ],
      default: "pending",
      index: true,
    },

    creatorRespondedAt: Date,

    /* =====================================================
       NEGOTIATION STATE CONTROL
    ===================================================== */

    negotiationStatus: {
      type: String,
      enum: ["open", "closed", "expired"],
      default: "open",
      index: true,
    },

    closedAt: Date,

    expiresAt: Date, // optional automatic expiration

    /* =====================================================
       CURRENT AGREED TERMS (FINAL VERSION)
    ===================================================== */

    currentTerms: {
      amount: {
        type: Number,
      },
      equity: {
        type: Number,
      },
    },

    /* =====================================================
       NEGOTIATION HISTORY (AUDIT TRAIL)
    ===================================================== */

    negotiationHistory: [
      {
        proposedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        role: {
          type: String,
          enum: ["investor", "creator"],
        },
        amount: Number,
        equity: Number,
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* =====================================================
       DEAL LINK (VERY IMPORTANT)
    ===================================================== */

    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
    },

    /* =====================================================
       META
    ===================================================== */

    requestId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    rejectionReason: String,
   
  },
  { timestamps: true }
);


/* =====================================================
   PREVENT DUPLICATE ACTIVE REQUESTS
===================================================== */

investmentRequestSchema.index(
  { investor: 1, project: 1, negotiationStatus: 1 },
  { unique: false }
);

const InvestmentRequest = mongoose.model(
  "InvestmentRequest",
  investmentRequestSchema
);

export default InvestmentRequest;