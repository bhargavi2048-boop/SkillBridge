/**
 * SkillBridge — Reviews Routes (routes/reviews.js)
 */

const router = require('express').Router();
const { Review, Notification } = require('../models/index');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/reviews/:userId
router.get('/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch reviews' }); }
});

// POST /api/reviews — Submit review after swap
router.post('/', protect, async (req, res) => {
  try {
    const { swapId, revieweeId, rating, review, tags } = req.body;
    const existing = await Review.findOne({ swap: swapId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ error: 'Already reviewed this swap' });

    const newReview = await Review.create({ swap: swapId, reviewer: req.user._id, reviewee: revieweeId, rating, review, tags });

    // Update reviewee's average rating
    const reviewee = await User.findById(revieweeId);
    await reviewee.updateRating(rating);
    await reviewee.checkBadges();

    // Notify reviewee
    await Notification.create({ user: revieweeId, type: 'review', title: 'New Review!', message: `${req.user.name} gave you ${rating} stars`, data: { reviewId: newReview._id } });

    res.status(201).json({ review: newReview });
  } catch (e) { res.status(500).json({ error: 'Review failed' }); }
});

module.exports = router;
