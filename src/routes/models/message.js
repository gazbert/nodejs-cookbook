import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // links to a User (like RDBMS foreign key)
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
