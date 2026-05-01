/**
 * SkillBridge — Users Routes (routes/users.js)
 */

const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users — Browse users with filtering
router.get('/', async (req, res) => {
  try {
    const { skill, location, rating, page = 1, limit = 12, search } = req.query;
    const query = { isBanned: false };
    if (location) query.location = new RegExp(location, 'i');
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (search) query.$text = { $search: search };
    if (skill) query['skillsOffered.name'] = new RegExp(skill, 'i');

    const users = await User.find(query)
      .select('-password -email')
      .sort({ rating: -1, swapsCompleted: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user || user.isBanned) return res.status(404).json({ error: 'User not found' });
    user.profileViews += 1;
    await user.save({ validateBeforeSave: false });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'college', 'location', 'avatar', 'github', 'linkedin', 'website', 'skillsOffered', 'skillsWanted', 'notifyEmail', 'notifyBrowser', 'language'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// POST /api/users/:id/endorse-skill
router.post('/:id/endorse-skill', protect, async (req, res) => {
  try {
    const { skillName, swapId } = req.body;
    const { Endorsement } = require('../models/index');
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    await Endorsement.create({ endorser: req.user._id, endorsee: req.params.id, skillName, swap: swapId });

    // Mark skill as verified if 3+ endorsements
    const count = await Endorsement.countDocuments({ endorsee: req.params.id, skillName });
    if (count >= 3) {
      await User.updateOne(
        { _id: req.params.id, 'skillsOffered.name': skillName },
        { $set: { 'skillsOffered.$.verified': true } }
      );
    }

    res.json({ message: 'Skill endorsed', totalEndorsements: count });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Already endorsed this skill' });
    res.status(500).json({ error: 'Endorsement failed' });
  }
});

module.exports = router;
