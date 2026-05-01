/**
 * SkillBridge — User Model (models/User.js)
 * Full-featured user schema with skills, ratings, badges, verification
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  level:    { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
  verified: { type: Boolean, default: false },
  endorsements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const badgeSchema = new mongoose.Schema({
  id:         String,
  name:       String,
  icon:       String,
  earnedAt:   { type: Date, default: Date.now },
  description: String
});

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true, maxlength: 80 },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  avatar:     { type: String, default: '' },
  bio:        { type: String, maxlength: 500 },
  college:    { type: String, default: '' },
  location:   { type: String, default: '' },
  language:   { type: String, enum: ['en', 'hi', 'ta', 'te'], default: 'en' },
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isBanned:   { type: Boolean, default: false },

  // Skills
  skillsOffered: [skillSchema],
  skillsWanted:  [skillSchema],

  // Stats
  swapsCompleted: { type: Number, default: 0 },
  totalSessions:  { type: Number, default: 0 },
  profileViews:   { type: Number, default: 0 },

  // Ratings
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  ratingCount:   { type: Number, default: 0 },

  // Badges & achievements
  badges: [badgeSchema],

  // Notifications preferences
  notifyEmail:   { type: Boolean, default: true },
  notifyBrowser: { type: Boolean, default: true },

  // Social
  github:    String,
  linkedin:  String,
  website:   String,

  // Session
  lastSeen:  { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update rating
userSchema.methods.updateRating = function(newRating) {
  const total = this.rating * this.ratingCount + newRating;
  this.ratingCount += 1;
  this.rating = Math.round((total / this.ratingCount) * 10) / 10;
  return this.save();
};

// Check and award badges
userSchema.methods.checkBadges = async function() {
  const BADGES = [
    { id: 'first_swap', name: 'First Swap!', icon: '🎉', condition: u => u.swapsCompleted >= 1, description: 'Completed your first skill swap' },
    { id: 'swap_5', name: '5 Swaps', icon: '🌟', condition: u => u.swapsCompleted >= 5, description: 'Completed 5 skill swaps' },
    { id: 'swap_10', name: 'Swap Master', icon: '🏆', condition: u => u.swapsCompleted >= 10, description: 'Completed 10 skill swaps' },
    { id: 'top_rated', name: 'Top Rated', icon: '⭐', condition: u => u.rating >= 4.5 && u.ratingCount >= 3, description: 'Maintained 4.5+ star rating' },
    { id: 'python_mentor', name: 'Python Mentor', icon: '🐍', condition: u => u.skillsOffered.some(s => s.name.toLowerCase().includes('python') && s.verified), description: 'Verified Python skill' },
    { id: 'early_adopter', name: 'Early Adopter', icon: '🚀', condition: u => u.createdAt < new Date('2025-01-01'), description: 'Joined SkillBridge early' }
  ];
  const existingBadgeIds = this.badges.map(b => b.id);
  for (const badge of BADGES) {
    if (!existingBadgeIds.includes(badge.id) && badge.condition(this)) {
      this.badges.push({ id: badge.id, name: badge.name, icon: badge.icon, description: badge.description });
    }
  }
  return this.save();
};

// Safe public profile (no password)
userSchema.methods.toPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Search index
userSchema.index({ name: 'text', bio: 'text', 'skillsOffered.name': 'text', 'skillsWanted.name': 'text' });
userSchema.index({ location: 1, rating: -1 });

module.exports = mongoose.model('User', userSchema);
