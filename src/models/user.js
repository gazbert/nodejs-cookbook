/* eslint-disable func-names */
import mongoose from 'mongoose';

// Creates schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true, // no dups allowed (like RDBMS primary key constraint)
  },
});

// This is a custom method we've added
userSchema.statics.findByLogin = async function (login) {
  let user = await this.findOne({
    username: login,
  });

  if (!user) {
    user = await this.findOne({ email: login });
  }

  return user;
};

// Pre-hook - if a user is deleted, all their messages are whacked too (like RDBMS cascade delete)
userSchema.pre('remove', function (next) {
  this.model('Message').deleteMany({ user: this._id }, next);
});

// Maps model to schema
const User = mongoose.model('User', userSchema);

export default User;
