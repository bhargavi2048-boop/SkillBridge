/**
 * SkillBridge — Messages Routes (routes/messages.js)
 */

const router = require('express').Router();
const { Message } = require('../models/index');
const { protect } = require('../middleware/auth');

// GET /api/messages/:roomId — Fetch chat history
router.get('/:roomId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ room: req.params.roomId, deletedAt: null })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ messages: messages.reverse() });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch messages' }); }
});

// PUT /api/messages/:roomId/read — Mark as read
router.put('/:roomId/read', protect, async (req, res) => {
  try {
    await Message.updateMany({ room: req.params.roomId, readBy: { $ne: req.user._id } }, { $push: { readBy: req.user._id } });
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ error: 'Failed to mark as read' }); }
});

module.exports = router;
