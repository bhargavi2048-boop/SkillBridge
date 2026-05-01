/**
 * SkillBridge — Notifications Routes (routes/notifications.js)
 */

const router = require('express').Router();
const { Notification } = require('../models/index');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications, unread });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true, readAt: new Date() });
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true, readAt: new Date() });
    res.json({ message: 'All notifications marked as read' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
