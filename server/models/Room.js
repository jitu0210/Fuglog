const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSubdoc = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const pastMemberSubdoc = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  leftAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters'],
  },
  inviteCode: {
    type: String,
    unique: true,
    index: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  members: [memberSubdoc],
  pastMembers: [pastMemberSubdoc],
  maxMembers: {
    type: Number,
    default: 10,
  },
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

roomSchema.pre('validate', function (next) {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = crypto.randomBytes(8).toString('hex');
  }
  if (this.members && this.members.length) {
    this.members = this.members.map((m) => {
      if (m == null) return m;
      if (m.user) return m;
      if (typeof m === 'string' || mongoose.Types.ObjectId.isValid(m)) {
        return { user: m, joinedAt: (m && m.joinedAt) || new Date() };
      }
      return m;
    });
  }
  next();
});

roomSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Room', roomSchema);
