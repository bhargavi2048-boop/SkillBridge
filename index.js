/**
 * SkillBridge — All Data Models
 * Swap, Message, Session, Review, Notification
 */

const mongoose = require('mongoose');

// ─── SWAP MODEL ───────────────────────────────────────────────────────────────
const swapSchema = new mongoose.Schema({
  requester:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterSkill: String,
  recipientSkill: String,
  status:        { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  message:       String,
  chatRoom:      String, // socket.io room ID
  completedAt:   Date,
  reviewDone:    { requester: Boolean, recipient: Boolean }
}, { timestamps: true });

swapSchema.pre('save', function(next) {
  if (!this.chatRoom) {
    this.chatRoom = `swap_${this._id}`;
  }
  next();
});

// ─── MESSAGE MODEL ────────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  room:    { type: String, required: true, index: true },
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  type:    { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
  readBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedAt: Date
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: -1 });

// ─── SESSION MODEL ────────────────────────────────────────────────────────────
const sessionSchema = new mongoose.Schema({
  swap:         { type: mongoose.Schema.Types.ObjectId, ref: 'Swap', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  title:        { type: String, required: true },
  scheduledAt:  { type: Date, required: true },
  duration:     { type: Number, default: 60 }, // minutes
  status:       { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  meetLink:     String, // Google Meet / Zoom link
  notes:        String,
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

sessionSchema.index({ scheduledAt: 1, status: 1 });

// ─── REVIEW MODEL ─────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  swap:     { type: mongoose.Schema.Types.ObjectId, ref: 'Swap', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  review:   { type: String, maxlength: 1000 },
  tags:     [String], // e.g. ['knowledgeable', 'patient', 'punctual']
  isVerifiedSwap: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ swap: 1, reviewer: 1 }, { unique: true });

// ─── NOTIFICATION MODEL ───────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['message', 'swap_request', 'swap_accepted', 'swap_rejected', 'session', 'review', 'badge', 'system'], required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  data:    mongoose.Schema.Types.Mixed, // extra context
  read:    { type: Boolean, default: false },
  readAt:  Date
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// ─── SKILL ENDORSEMENT MODEL ──────────────────────────────────────────────────
const endorsementSchema = new mongoose.Schema({
  endorser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endorsee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillName: { type: String, required: true },
  swap:      { type: mongoose.Schema.Types.ObjectId, ref: 'Swap' },
  message:   String
}, { timestamps: true });

endorsementSchema.index({ endorser: 1, endorsee: 1, skillName: 1 }, { unique: true });

module.exports = {
  Swap:        mongoose.model('Swap', swapSchema),
  Message:     mongoose.model('Message', messageSchema),
  Session:     mongoose.model('Session', sessionSchema),
  Review:      mongoose.model('Review', reviewSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Endorsement:  mongoose.model('Endorsement', endorsementSchema)
};
