/**
 * SkillBridge — Skills Routes (routes/skills.js)
 */

const router = require('express').Router();
const User = require('../models/User');

// GET /api/skills — Get all unique skills with user counts
router.get('/', async (req, res) => {
  try {
    const offered = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered.name', count: { $sum: 1 }, verified: { $sum: { $cond: ['$skillsOffered.verified', 1, 0] } } } },
      { $sort: { count: -1 } }, { $limit: 100 }
    ]);
    const wanted = await User.aggregate([
      { $unwind: '$skillsWanted' },
      { $group: { _id: '$skillsWanted.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 50 }
    ]);
    res.json({ offered, wanted });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch skills' }); }
});

// GET /api/skills/match — Find skill swap matches for current user
router.get('/match/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('skillsOffered skillsWanted location');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const myOffered = user.skillsOffered.map(s => s.name.toLowerCase());
    const myWanted  = user.skillsWanted.map(s => s.name.toLowerCase());

    // Find users who want what I offer AND offer what I want
    const matches = await User.find({
      _id: { $ne: req.params.userId },
      isBanned: false,
      $or: [
        { 'skillsWanted.name': { $in: myOffered.map(s => new RegExp(s, 'i')) } },
        { 'skillsOffered.name': { $in: myWanted.map(s => new RegExp(s, 'i')) } }
      ]
    }).select('-password').limit(20);

    // Score each match
    const scored = matches.map(m => {
      let score = 0;
      const theirOffered = m.skillsOffered.map(s => s.name.toLowerCase());
      const theirWanted  = m.skillsWanted.map(s => s.name.toLowerCase());
      myWanted.forEach(s => { if (theirOffered.some(t => t.includes(s) || s.includes(t))) score += 40; });
      myOffered.forEach(s => { if (theirWanted.some(t => t.includes(s) || s.includes(t))) score += 40; });
      if (user.location && m.location && m.location.toLowerCase().includes(user.location.toLowerCase())) score += 20;
      return { user: m, matchScore: Math.min(score, 100) };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ matches: scored });
  } catch (e) { res.status(500).json({ error: 'Match failed' }); }
});

module.exports = router;
