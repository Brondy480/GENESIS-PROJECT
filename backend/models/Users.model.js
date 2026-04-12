import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  userType: { type: String, required: true, enum: ['creator', 'backer', 'investor', 'admin'] },
  firstName: String,
  lastName: String,
  profileImage: String,
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'suspended'], 
    default: 'pending' 
  },
  verificationReason: {
    type: String,
    default: null
  },
  verifiedAt: {
  type: Date,
  default: null
},
rejectedAt: {
  type: Date,
  default: null
},
savedProjects: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
],

suspendedAt: Date,
  suspensionReason: String,

}, { discriminatorKey: 'userType', timestamps: true });

const Users = mongoose.model('Users', UsersSchema);
export default Users;
