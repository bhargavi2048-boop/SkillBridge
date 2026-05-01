/**
 * SkillBridge — Sessions Routes (routes/sessions.js)
 */

const router = require('express').Router();
const { Session, Notification } = require('../models/index');
const { protect } = require('../middleware/auth');
const { sendSessionReminderEmail } = require('../utils/emailService');

// GET /api/sessions — My sessions
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ participants: req.user._id })
      .populate('participants', 'name avatar email')
      .populate('swap')
      .sort({ scheduledAt: 1 });
    res.json({ sessions });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch sessions' }); }
});

// POST /api/sessions — Schedule a session
router.post('/', protect, async (req, res) => {
  try {
    const { swapId, title, scheduledAt, duration, participants, notes } = req.body;
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}`;
    const session = await Session.create({ swap: swapId, title, scheduledAt: new Date(scheduledAt), duration, participants, notes, meetLink });

    // Notify all participants
    for (const pid of participants) {
      if (pid.toString() !== req.user._id.toString()) {
        await Notification.create({ user: pid, type: 'session', title: 'Session Scheduled!', message: `${title} on ${new Date(scheduledAt).toLocaleDateString()}`, data: { sessionId: session._id, meetLink } });
      }
    }
    res.status(201).json({ session });
  } catch (e) { res.status(500).json({ error: 'Failed to schedule session' }); }
});

module.exports = router;
