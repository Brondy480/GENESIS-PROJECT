import mongoose from 'mongoose';
import User from './Users.model.js';

const adminSchema = new mongoose.Schema({
  roleLevel: {
    type: String,
    enum: ['moderator', 'superadmin'],
    default: 'moderator'
  },
  permissions: {
    type: [String],
    default: ['manageUsers', 'approveProjects', 'reviewInvestments']
  }
}, { timestamps: true });

const Admin = User.discriminator('admin', adminSchema);

export default Admin;
