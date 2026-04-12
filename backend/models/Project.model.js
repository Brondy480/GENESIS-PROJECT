import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    /* ==============================
       BASIC INFO
    ============================== */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    tags: [String],

    /* ==============================
       CREATOR
    ============================== */
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    /* ==============================
       MEDIA
    ============================== */
    coverImage: {
      type: String, // Cloudinary URL
      required: true,
    },

    gallery: [String], // optional extra images

    /* ==============================
       FUNDING (BACKERS)
    ============================== */
    fundingGoal: {
      type: Number,
      default: 0,
    },

    totalFunded: {
      type: Number,
      default: 0,
    },

    allowFunding: {
      type: Boolean,
      default: true,
    },
  

    /* ==============================
       INVESTMENT (INVESTORS)
    ============================== */
    allowInvestment: {
      type: Boolean,
      default: true,
    },

    valuation: {
      type: Number, // optional
    },

equityAvailable: {
  type: Number,
  min: 0,
  max: 100,
  required: true,
},
equityLocked: {
  type: Number,
  default: 0,
  min: 0
},

    /* ==============================
       STATUS & MODERATION
    ============================== */
    status: {
      type: String,
      enum: ["draft", "active", "funded", "sold", "cancelled",'inactive'],
      default: "draft",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: String,

    /* ==============================
       COMMENTS (SOCIAL)
    ============================== */
 comments: [
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    userType: {
      type: String,
      enum: ["creator", "backer", "investor"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    replies: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },

        userType: {
          type: String,
          enum: ["creator", "backer", "investor"],
          required: true,
        },

        content: {
          type: String,
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
],


    /* ==============================
   SOCIAL (LIKES)
============================== */
likes: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    userType: {
      type: String,
      enum: ["creator", "backer", "investor"],
    },
    likedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

likesCount: {
  type: Number,
  default: 0,
},

funders: [
  {
    backer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    amount: Number,
    fundedAt: {
      type: Date,
      default: Date.now,
    },
  },
],
shareholders: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    equityOwned: Number
  }
]
,
legalDocuments: [
  {
    type: {
      type: String,
      enum: ["share_agreement"],
    },
    fileUrl: String,
    signedByCreator: {
      type: Boolean,
      default: false,
    },
    signedByInvestor: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],
currentAmount: {
   type: Number,
   default: 0
},
targetAmount: {
   type: Number,
   required: true
},
Lifestatus: {
  type: String,
  enum: ["pending", "active", "funded", "failed", "closed"],
  default: "active"
},

escrowLocked: {
  type: Boolean,
  default: true
},

deadline: {
  type: Date,
  required: true
},




    /* ==============================
       MEDIA EXTRAS
    ============================== */
    demoVideoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    businessPlan: {
      type: String, // Cloudinary URL
      default: null,
    },

    /* ==============================
       META
    ============================== */
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
 
  { timestamps: true }
);



const Project = mongoose.model("Project", projectSchema);
export default Project;
