/**
 * SkillBridge — Admin Routes (routes/admin.js)
 */

const router = require('express').Router();
const User = require('../models/User');
const { Swap, Review, Notification } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalSwaps, completedSwaps, totalReviews, newUsersToday] = await Promise.all([
      User.countDocuments({ isBanned: false }),
      Swap.countDocuments(),
      Swap.countDocuments({ status: 'completed' }),
      Review.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } })
    ]);

    // Top skills
    const skillAgg = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]);

    res.json({ totalUsers, totalSwaps, completedSwaps, totalReviews, newUsersToday, topSkills: skillAgg });
  } catch (e) { res.status(500).json({ error: 'Stats failed' }); }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, banned } = req.query;
    const query = {};
    if (banned !== undefined) query.isBanned = banned === 'true';
    if (search) query.$text = { $search: search };
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { ban, reason } = req.body;
    await User.findByIdAndUpdate(req.params.id, { isBanned: ban });
    if (ban) {
      await Notification.create({ user: req.params.id, type: 'system', title: 'Account Suspended', message: reason || 'Your account has been suspended for violating community guidelines.' });
    }
    res.json({ message: ban ? 'User banned' : 'User unbanned' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review removed' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
