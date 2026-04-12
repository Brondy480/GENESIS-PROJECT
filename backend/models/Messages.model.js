import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  messageId: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversationId: String,
  messageText: String,
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;
