/**
 * SkillBridge — Swaps Routes (routes/swaps.js)
 */

const router = require('express').Router();
const { Swap, Notification } = require('../models/index');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/swaps — My swaps
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { $or: [{ requester: req.user._id }, { recipient: req.user._id }] };
    if (status) query.status = status;
    const swaps = await Swap.find(query)
      .populate('requester', 'name avatar rating')
      .populate('recipient', 'name avatar rating')
      .sort({ createdAt: -1 });
    res.json({ swaps });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch swaps' });
  }
});

// POST /api/swaps — Create swap request
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId, requesterSkill, recipientSkill, message } = req.body;
    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: 'User not found' });

    const swap = await Swap.create({ requester: req.user._id, recipient: recipientId, requesterSkill, recipientSkill, message });

    // Notify recipient
    await Notification.create({
      user: recipientId, type: 'swap_request',
      title: 'New Swap Request!',
      message: `${req.user.name} wants to swap ${requesterSkill} ↔ ${recipientSkill}`,
      data: { swapId: swap._id, requesterId: req.user._id }
    });

    // Real-time notification via socket
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    const targetSocket = onlineUsers.get(recipientId.toString());
    if (targetSocket) io.to(targetSocket).emit('newSwapRequest', { swap, from: req.user });

    res.status(201).json({ swap });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create swap' });
  }
});

// PUT /api/swaps/:id — Accept/reject/complete
router.put('/:id', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const swap = await Swap.findById(req.params.id).populate('requester recipient');
    if (!swap) return res.status(404).json({ error: 'Swap not found' });

    const isParticipant = [swap.requester._id.toString(), swap.recipient._id.toString()].includes(req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ error: 'Not authorized' });

    if (action === 'accept' && swap.recipient._id.toString() === req.user._id.toString()) {
      swap.status = 'accepted';
      await Notification.create({ user: swap.requester._id, type: 'swap_accepted', title: 'Swap Accepted!', message: `${swap.recipient.name} accepted your swap request!`, data: { swapId: swap._id } });
    } else if (action === 'reject') {
      swap.status = 'rejected';
      await Notification.create({ user: swap.requester._id, type: 'swap_rejected', title: 'Swap Update', message: `${swap.recipient.name} is unavailable right now`, data: { swapId: swap._id } });
    } else if (action === 'complete') {
      swap.status = 'completed';
      swap.completedAt = new Date();
      // Increment swap counts
      await User.updateOne({ _id: swap.requester._id }, { $inc: { swapsCompleted: 1 } });
      await User.updateOne({ _id: swap.recipient._id }, { $inc: { swapsCompleted: 1 } });
      // Check badges
      const [requester, recipient] = await Promise.all([User.findById(swap.requester._id), User.findById(swap.recipient._id)]);
      await requester.checkBadges();
      await recipient.checkBadges();
    }

    await swap.save();
    res.json({ swap });
  } catch (e) {
    res.status(500).json({ error: 'Swap update failed' });
  }
});

module.exports = router;
