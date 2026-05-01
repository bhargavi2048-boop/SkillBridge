/**
 * SkillBridge — Email Service (utils/emailService.js)
 * Nodemailer-based transactional emails
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const FROM = process.env.EMAIL_FROM || 'SkillBridge <noreply@skillbridge.io>';

const brandedTemplate = (title, content) => `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:-apple-system,sans-serif;background:#0f1117;color:#e2e8f0;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;padding:32px 24px}
.logo{font-size:1.5rem;font-weight:800;color:#00d4c8;margin-bottom:24px}
.logo span{color:#0ea5e9}
.card{background:#1e2533;border-radius:16px;padding:28px;border:1px solid rgba(255,255,255,0.08)}
h2{margin:0 0 12px;color:#fff;font-size:1.25rem}
p{color:#94a3b8;line-height:1.6;margin:8px 0}
.btn{display:inline-block;background:linear-gradient(135deg,#00d4c8,#0ea5e9);color:#000;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px}
.footer{margin-top:24px;color:#4a5568;font-size:0.8rem;text-align:center}
</style></head>
<body><div class="wrap">
  <div class="logo">Skill<span>Bridge</span></div>
  <div class="card">
    <h2>${title}</h2>
    ${content}
  </div>
  <div class="footer">© 2025 SkillBridge · India's Peer Skill Exchange Platform<br>
  <a href="#" style="color:#00d4c8">Unsubscribe</a></div>
</div></body></html>`;

exports.sendWelcomeEmail = async (user) => {
  if (!process.env.SMTP_USER) return;
  await transporter.sendMail({
    from: FROM, to: user.email,
    subject: '🎉 Welcome to SkillBridge!',
    html: brandedTemplate('Welcome to SkillBridge!', `
      <p>Hey <strong style="color:#fff">${user.name}</strong>,</p>
      <p>You've joined India's smartest peer-to-peer skill exchange platform. Start by exploring swap partners or analyzing your skill gaps with our AI tools.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn">Explore SkillBridge →</a>
    `)
  });
};

exports.sendSwapRequestEmail = async (recipient, requester, swap) => {
  if (!process.env.SMTP_USER || !recipient.notifyEmail) return;
  await transporter.sendMail({
    from: FROM, to: recipient.email,
    subject: `⇄ New Swap Request from ${requester.name}`,
    html: brandedTemplate('You have a new swap request!', `
      <p><strong style="color:#fff">${requester.name}</strong> wants to swap skills with you!</p>
      <p>They offer: <strong style="color:#00d4c8">${swap.requesterSkill}</strong></p>
      <p>They want to learn: <strong style="color:#0ea5e9">${swap.recipientSkill}</strong></p>
      ${swap.message ? `<p>Message: "${swap.message}"</p>` : ''}
      <a href="${process.env.CLIENT_URL}/swaps" class="btn">View Request →</a>
    `)
  });
};

exports.sendSessionReminderEmail = async (session, user) => {
  if (!process.env.SMTP_USER) return;
  const when = new Date(session.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await transporter.sendMail({
    from: FROM, to: user.email,
    subject: `⏰ Session Reminder: ${session.title} in 1 hour`,
    html: brandedTemplate('Session Starting Soon!', `
      <p>Your session <strong style="color:#fff">${session.title}</strong> starts in 1 hour.</p>
      <p>Time: <strong style="color:#00d4c8">${when} IST</strong></p>
      <p>Duration: ${session.duration} minutes</p>
      ${session.meetLink ? `<a href="${session.meetLink}" class="btn">Join Google Meet →</a>` : ''}
    `)
  });
};

// Cron-driven: check for sessions starting in ~1 hour
exports.sendSessionReminders = async () => {
  const { Session } = require('../models/index');
  const User = require('../models/User');
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  const window = new Date(Date.now() + 65 * 60 * 1000);
  const sessions = await Session.find({ scheduledAt: { $gte: oneHourFromNow, $lte: window }, status: 'scheduled', reminderSent: false }).populate('participants');
  for (const session of sessions) {
    for (const participant of session.participants) {
      await exports.sendSessionReminderEmail(session, participant);
    }
    session.reminderSent = true;
    await session.save();
  }
};
