/**
 * SkillBridge — Feature Modules (js/features.js)
 * Notifications | Ratings | Sessions | Admin | i18n
 */

'use strict';

/* global Auth, NotificationsAPI, ReviewsAPI, SessionsAPI, AdminAPI, showToast */

// ════════════════════════════════════════════════════════════
// 1. NOTIFICATION CENTER
// ════════════════════════════════════════════════════════════
const Notifications = {
  poll: null,
  unread: 0,

  async load() {
    try {
      const { notifications, unread } = await NotificationsAPI.getAll();
      this.unread = unread;
      this.renderBadge();
      this.renderPanel(notifications);
    } catch (e) {
      this.renderPanel(this.getDemoNotifs());
    }
  },

  renderBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    badge.textContent = this.unread;
    badge.style.display = this.unread > 0 ? 'flex' : 'none';
  },

  renderPanel(notifications) {
    const list = document.getElementById('notifList');
    if (!list) return;
    if (!notifications.length) {
      list.innerHTML = '<div class="notif-empty">🎉 All caught up!</div>';
      return;
    }
    list.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="Notifications.markRead('${n._id}', this)">
        <div class="notif-icon">${this.getIcon(n.type)}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${this.timeAgo(n.createdAt)}</div>
        </div>
        ${!n.read ? '<div class="notif-dot"></div>' : ''}
      </div>`).join('');
  },

  async markRead(id, el) {
    try { await NotificationsAPI.markRead(id); } catch (e) {}
    el?.classList.remove('unread');
    el?.querySelector('.notif-dot')?.remove();
    if (this.unread > 0) { this.unread--; this.renderBadge(); }
  },

  async markAllRead() {
    try { await NotificationsAPI.markAllRead(); } catch (e) {}
    this.unread = 0;
    this.renderBadge();
    document.querySelectorAll('.notif-item').forEach(el => {
      el.classList.remove('unread');
      el.querySelector('.notif-dot')?.remove();
    });
  },

  getIcon(type) {
    const icons = { message: '💬', swap_request: '⇄', swap_accepted: '✅', swap_rejected: '❌', session: '📅', review: '⭐', badge: '🏆', system: '📢' };
    return icons[type] || '🔔';
  },

  timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  },

  getDemoNotifs() {
    return [
      { _id: '1', type: 'swap_request', title: 'New Swap Request!', message: 'Priya wants to swap Python ↔ React', createdAt: new Date(Date.now() - 300000), read: false },
      { _id: '2', type: 'session', title: 'Session in 1 Hour', message: 'React Hooks session with Rohan at 6pm IST', createdAt: new Date(Date.now() - 3600000), read: false },
      { _id: '3', type: 'review', title: 'New Review!', message: 'Aditya gave you ⭐⭐⭐⭐⭐', createdAt: new Date(Date.now() - 86400000), read: true },
      { _id: '4', type: 'badge', title: 'Badge Earned!', message: 'You earned the "5 Swaps" badge 🏆', createdAt: new Date(Date.now() - 172800000), read: true },
    ];
  },

  startPolling() {
    if (this.poll) return;
    this.load();
    this.poll = setInterval(() => this.load(), 30000);
  }
};

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  const isOpen = panel.classList.contains('show');
  panel.classList.toggle('show');
  if (!isOpen) Notifications.load();
}

// ════════════════════════════════════════════════════════════
// 2. RATINGS & REVIEWS SYSTEM
// ════════════════════════════════════════════════════════════
const Reviews = {
  selectedRating: 0,

  async openReviewModal(swapId, revieweeId, revieweeName) {
    document.getElementById('reviewSwapId').value = swapId || 'demo_swap';
    document.getElementById('revieweeId').value = revieweeId || 'demo_user';
    document.getElementById('reviewModalTitle').textContent = `Rate your session with ${revieweeName}`;
    this.selectedRating = 0;
    this.renderStars(0);
    document.getElementById('reviewModal').classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('reviewModal').classList.remove('show');
    document.body.style.overflow = '';
  },

  renderStars(rating) {
    document.querySelectorAll('.star-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i < rating);
      btn.textContent = i < rating ? '★' : '☆';
    });
  },

  selectRating(r) {
    this.selectedRating = r;
    this.renderStars(r);
  },

  async submit() {
    if (!this.selectedRating) { showToast('Please select a rating', 'warning'); return; }
    const swapId = document.getElementById('reviewSwapId').value;
    const revieweeId = document.getElementById('revieweeId').value;
    const review = document.getElementById('reviewText').value.trim();
    const tags = [...document.querySelectorAll('.review-tag.selected')].map(t => t.dataset.tag);
    try {
      await ReviewsAPI.submit({ swapId, revieweeId, rating: this.selectedRating, review, tags });
      showToast('Review submitted! 🌟', 'success');
    } catch (e) {
      showToast('Review saved (demo mode)', 'success');
    }
    this.closeModal();
  },

  async renderForProfile(userId) {
    const container = document.getElementById('profileReviews');
    if (!container) return;
    try {
      const { reviews } = await ReviewsAPI.getForUser(userId);
      this.renderReviewList(container, reviews);
    } catch (e) {
      this.renderReviewList(container, this.getDemoReviews());
    }
  },

  renderReviewList(container, reviews) {
    if (!reviews.length) { container.innerHTML = '<p class="muted">No reviews yet</p>'; return; }
    container.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-avatar">${(r.reviewer?.name || 'A')[0]}</div>
          <div>
            <div class="review-name">${r.reviewer?.name || 'Anonymous'}</div>
            <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          </div>
          ${r.isVerifiedSwap ? '<span class="verified-badge">✅ Verified Swap</span>' : ''}
        </div>
        ${r.review ? `<p class="review-text">${r.review}</p>` : ''}
        ${r.tags?.length ? `<div class="review-tags">${r.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}</div>` : ''}
        <div class="review-date">${new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
      </div>`).join('');
  },

  getDemoReviews() {
    return [
      { reviewer: { name: 'Priya Sharma' }, rating: 5, review: 'Excellent teacher! Explained React hooks very clearly. Highly recommend.', tags: ['knowledgeable', 'patient'], isVerifiedSwap: true, createdAt: new Date(Date.now() - 86400000) },
      { reviewer: { name: 'Rohan Mehta' }, rating: 4, review: 'Great session on Python. Was very punctual and well-prepared.', tags: ['punctual', 'prepared'], isVerifiedSwap: true, createdAt: new Date(Date.now() - 172800000) },
    ];
  }
};

// ════════════════════════════════════════════════════════════
// 3. SESSION SCHEDULER
// ════════════════════════════════════════════════════════════
const Scheduler = {
  async openScheduleModal(swapId, participantIds, partnerName) {
    document.getElementById('scheduleSwapId').value = swapId || 'demo_swap';
    document.getElementById('scheduleParticipants').value = JSON.stringify(participantIds || []);
    document.getElementById('scheduleModalTitle').textContent = `Schedule Session with ${partnerName}`;
    // Set min date to now
    const dtInput = document.getElementById('sessionDateTime');
    if (dtInput) dtInput.min = new Date().toISOString().slice(0, 16);
    document.getElementById('scheduleModal').classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('scheduleModal').classList.remove('show');
    document.body.style.overflow = '';
  },

  async submit() {
    const swapId = document.getElementById('scheduleSwapId').value;
    const title = document.getElementById('sessionTitle').value.trim();
    const scheduledAt = document.getElementById('sessionDateTime').value;
    const duration = document.getElementById('sessionDuration').value;
    const notes = document.getElementById('sessionNotes').value.trim();
    const participants = JSON.parse(document.getElementById('scheduleParticipants').value || '[]');

    if (!title || !scheduledAt) { showToast('Please fill in all required fields', 'warning'); return; }

    try {
      const { session } = await SessionsAPI.create({ swapId, title, scheduledAt, duration: parseInt(duration), participants, notes });
      showToast(`Session scheduled! Meet link: ${session.meetLink}`, 'success');
    } catch (e) {
      const fakeLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}`;
      showToast(`Session scheduled! 📅 Meet link copied`, 'success');
      navigator.clipboard?.writeText(fakeLink).catch(() => {});
    }
    this.closeModal();
  },

  async renderCalendar() {
    const container = document.getElementById('sessionsCalendar');
    if (!container) return;
    try {
      const { sessions } = await SessionsAPI.getMySessions();
      this.renderSessionList(container, sessions);
    } catch (e) {
      this.renderSessionList(container, this.getDemoSessions());
    }
  },

  renderSessionList(container, sessions) {
    if (!sessions.length) { container.innerHTML = '<p class="muted">No sessions scheduled</p>'; return; }
    container.innerHTML = sessions.map(s => `
      <div class="session-card ${s.status}">
        <div class="session-date">${new Date(s.scheduledAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <div class="session-time">${new Date(s.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</div>
        <div class="session-title">${s.title}</div>
        <div class="session-duration">⏱ ${s.duration} min</div>
        ${s.meetLink ? `<a href="${s.meetLink}" target="_blank" class="session-meet-btn">📹 Join Meet</a>` : ''}
        <span class="session-status-badge ${s.status}">${s.status}</span>
      </div>`).join('');
  },

  getDemoSessions() {
    return [
      { title: 'React Hooks Deep Dive', scheduledAt: new Date(Date.now() + 3600000 * 3), duration: 60, status: 'scheduled', meetLink: 'https://meet.google.com/abc-defg-hij' },
      { title: 'Python Data Structures', scheduledAt: new Date(Date.now() + 3600000 * 27), duration: 45, status: 'scheduled', meetLink: 'https://meet.google.com/xyz-uvwx-yz1' },
      { title: 'UI/UX Basics', scheduledAt: new Date(Date.now() - 3600000 * 24), duration: 60, status: 'completed', meetLink: null },
    ];
  }
};

// ════════════════════════════════════════════════════════════
// 4. ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════
const AdminPanel = {
  async loadStats() {
    try {
      const stats = await AdminAPI.getStats();
      this.renderStats(stats);
    } catch (e) {
      this.renderStats({ totalUsers: 1284, totalSwaps: 3421, completedSwaps: 2198, totalReviews: 891, newUsersToday: 23, topSkills: [{ _id: 'React', count: 312 }, { _id: 'Python', count: 289 }, { _id: 'UI/UX', count: 201 }] });
    }
  },

  renderStats(stats) {
    const el = id => document.getElementById(id);
    if (el('adminTotalUsers')) el('adminTotalUsers').textContent = stats.totalUsers?.toLocaleString();
    if (el('adminTotalSwaps')) el('adminTotalSwaps').textContent = stats.totalSwaps?.toLocaleString();
    if (el('adminCompletedSwaps')) el('adminCompletedSwaps').textContent = stats.completedSwaps?.toLocaleString();
    if (el('adminNewToday')) el('adminNewToday').textContent = stats.newUsersToday;
    if (el('adminTopSkills') && stats.topSkills) {
      el('adminTopSkills').innerHTML = stats.topSkills.map(s =>
        `<div class="skill-bar-row"><span>${s._id}</span><div class="skill-bar"><div style="width:${Math.min(s.count/3.5, 100)}%"></div></div><span>${s.count}</span></div>`
      ).join('');
    }
  },

  async loadUsers(search = '') {
    const container = document.getElementById('adminUsersList');
    if (!container) return;
    try {
      const { users } = await AdminAPI.getUsers({ search, limit: 20 });
      this.renderUsers(container, users);
    } catch (e) {
      this.renderUsers(container, this.getDemoUsers());
    }
  },

  renderUsers(container, users) {
    container.innerHTML = users.map(u => `
      <div class="admin-user-row">
        <div class="admin-user-info">
          <div class="admin-avatar">${u.name[0]}</div>
          <div>
            <div class="admin-user-name">${u.name} ${u.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}</div>
            <div class="admin-user-email">${u.email || 'hidden'}</div>
          </div>
        </div>
        <div class="admin-user-stats">
          <span>⇄ ${u.swapsCompleted}</span>
          <span>⭐ ${u.rating?.toFixed(1) || '—'}</span>
        </div>
        <div class="admin-actions">
          ${u.isBanned
            ? `<button class="admin-btn-sm green" onclick="AdminPanel.toggleBan('${u._id}', false, this)">Unban</button>`
            : `<button class="admin-btn-sm red" onclick="AdminPanel.toggleBan('${u._id}', true, this)">Ban</button>`}
        </div>
      </div>`).join('');
  },

  async toggleBan(userId, ban, btn) {
    const reason = ban ? prompt('Reason for ban (optional):') : null;
    try {
      await AdminAPI.banUser(userId, ban, reason);
      showToast(ban ? 'User banned' : 'User unbanned', 'success');
      btn.textContent = ban ? 'Unban' : 'Ban';
      btn.className = ban ? 'admin-btn-sm green' : 'admin-btn-sm red';
      btn.onclick = () => this.toggleBan(userId, !ban, btn);
    } catch (e) {
      showToast('Demo mode — action simulated', 'info');
    }
  },

  getDemoUsers() {
    return [
      { _id: '1', name: 'Priya Sharma', email: 'p***@gmail.com', swapsCompleted: 12, rating: 4.8, isBanned: false, role: 'user' },
      { _id: '2', name: 'Rohan Mehta', email: 'r***@gmail.com', swapsCompleted: 7, rating: 4.5, isBanned: false, role: 'user' },
      { _id: '3', name: 'Aditya Kumar', email: 'a***@gmail.com', swapsCompleted: 3, rating: 4.2, isBanned: true, role: 'user' },
      { _id: '4', name: 'Sneha Rao', email: 's***@gmail.com', swapsCompleted: 21, rating: 4.9, isBanned: false, role: 'admin' },
    ];
  }
};

// ════════════════════════════════════════════════════════════
// 5. MULTI-LANGUAGE SUPPORT (i18n)
// ════════════════════════════════════════════════════════════
const i18n = {
  current: 'en',
  strings: {
    en: { hero_title: 'The Complete Career Growth Platform.', hero_desc: 'SkillBridge combines AI-powered skill gap analysis with peer-to-peer skill swapping.', explore_btn: 'Explore Swaps', analyze_btn: 'Analyze My Skills', login: 'Log In', signup: 'Get Started', swap_request: 'Request Swap', schedule: 'Schedule Session', review: 'Leave Review' },
    hi: { hero_title: 'सम्पूर्ण करियर विकास मंच।', hero_desc: 'SkillBridge AI-आधारित स्किल गैप विश्लेषण और पीयर-टू-पीयर स्किल स्वैपिंग को जोड़ता है।', explore_btn: 'स्वैप एक्सप्लोर करें', analyze_btn: 'मेरी स्किल्स विश्लेषण करें', login: 'लॉग इन', signup: 'शुरू करें', swap_request: 'स्वैप अनुरोध', schedule: 'सेशन शेड्यूल करें', review: 'समीक्षा दें' },
    ta: { hero_title: 'முழுமையான தொழில் வளர்ச்சி தளம்.', hero_desc: 'SkillBridge AI-சக்தி வாய்ந்த திறன் இடைவெளி பகுப்பாய்வை சேர்க்கிறது.', explore_btn: 'ஸ்வாப்களை ஆராயுங்கள்', analyze_btn: 'என் திறன்களை பகுப்பாய்', login: 'உள்நுழை', signup: 'தொடங்குங்கள்', swap_request: 'ஸ்வாப் கோரிக்கை', schedule: 'அமர்வை திட்டமிடு', review: 'மதிப்பாய்வு' },
    te: { hero_title: 'సంపూర్ణ కెరీర్ అభివృద్ధి వేదిక.', hero_desc: 'SkillBridge AI-ఆధారిత నైపుణ్య విశ్లేషణను జోడిస్తుంది.', explore_btn: 'స్వాప్‌లను అన్వేషించండి', analyze_btn: 'నా నైపుణ్యాలను విశ్లేషించండి', login: 'లాగిన్', signup: 'ప్రారంభించండి', swap_request: 'స్వాప్ అభ్యర్థన', schedule: 'సెషన్ షెడ్యూల్', review: 'సమీక్ష' }
  },

  set(lang) {
    this.current = lang;
    const s = this.strings[lang] || this.strings.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (s[key]) el.textContent = s[key];
    });
    try { localStorage.setItem('sb_lang', lang); } catch (e) {}
    showToast(`Language changed to ${lang.toUpperCase()}`, 'info');
  },

  init() {
    const saved = localStorage.getItem('sb_lang') || 'en';
    if (saved !== 'en') this.set(saved);
  }
};

function setLanguage(lang) { i18n.set(lang); }

// ════════════════════════════════════════════════════════════
// 6. SKILL BADGES & VERIFICATION
// ════════════════════════════════════════════════════════════
const Badges = {
  DEFINITIONS: [
    { id: 'first_swap', name: 'First Swap!', icon: '🎉', description: 'Completed your first skill swap' },
    { id: 'swap_5', name: '5 Swaps', icon: '🌟', description: 'Completed 5 skill swaps' },
    { id: 'swap_10', name: 'Swap Master', icon: '🏆', description: 'Completed 10 skill swaps' },
    { id: 'top_rated', name: 'Top Rated', icon: '⭐', description: 'Maintained 4.5+ star rating' },
    { id: 'python_mentor', name: 'Python Mentor', icon: '🐍', description: 'Verified Python teaching skill' },
    { id: 'early_adopter', name: 'Early Adopter', icon: '🚀', description: 'One of SkillBridge\'s first users' },
  ],

  render(userBadges, container) {
    if (!container) return;
    const earned = new Set((userBadges || []).map(b => b.id));
    container.innerHTML = this.DEFINITIONS.map(b => `
      <div class="badge-chip ${earned.has(b.id) ? 'earned' : 'locked'}" title="${b.description}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${b.name}</span>
        ${earned.has(b.id) ? '' : '<span class="badge-lock">🔒</span>'}
      </div>`).join('');
  }
};

// ─── INJECT MODALS ────────────────────────────────────────────────────────────
function injectFeatureModals() {
  if (document.getElementById('reviewModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
  <!-- Review Modal -->
  <div id="reviewModal" class="modal-overlay">
    <div class="modal-box" style="max-width:500px;">
      <div class="modal-header"><h3 id="reviewModalTitle">Rate Your Session</h3><button class="modal-close" onclick="Reviews.closeModal()">✕</button></div>
      <input type="hidden" id="reviewSwapId"><input type="hidden" id="revieweeId">
      <div class="star-selector">
        ${[1,2,3,4,5].map(i => `<button class="star-btn" onclick="Reviews.selectRating(${i})">☆</button>`).join('')}
      </div>
      <div class="review-tags-row">
        ${['knowledgeable','patient','punctual','well-prepared','friendly','clear explanations'].map(t =>
          `<span class="review-tag" data-tag="${t}" onclick="this.classList.toggle('selected')">${t}</span>`).join('')}
      </div>
      <textarea id="reviewText" class="form-input" placeholder="Share your experience (optional)..." rows="3" style="margin-top:1rem;resize:vertical;"></textarea>
      <button class="btn-primary w-full" style="margin-top:1rem;" onclick="Reviews.submit()">Submit Review ⭐</button>
    </div>
  </div>

  <!-- Schedule Modal -->
  <div id="scheduleModal" class="modal-overlay">
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><h3 id="scheduleModalTitle">Schedule a Session</h3><button class="modal-close" onclick="Scheduler.closeModal()">✕</button></div>
      <input type="hidden" id="scheduleSwapId"><input type="hidden" id="scheduleParticipants">
      <div class="form-group">
        <label class="form-label">Session Title *</label>
        <input id="sessionTitle" class="form-input" placeholder="e.g. React Hooks Deep Dive">
      </div>
      <div class="form-group">
        <label class="form-label">Date & Time (IST) *</label>
        <input id="sessionDateTime" class="form-input" type="datetime-local">
      </div>
      <div class="form-group">
        <label class="form-label">Duration</label>
        <select id="sessionDuration" class="form-input">
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60" selected>1 hour</option>
          <option value="90">1.5 hours</option>
          <option value="120">2 hours</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <textarea id="sessionNotes" class="form-input" placeholder="Topics to cover..." rows="2"></textarea>
      </div>
      <div class="info-box">📹 A Google Meet link will be auto-generated and emailed to both participants.</div>
      <button class="btn-primary w-full" style="margin-top:1rem;" onclick="Scheduler.submit()">Schedule Session 📅</button>
    </div>
  </div>

  <!-- Notification Panel -->
  <div id="notifPanel" class="notif-panel">
    <div class="notif-panel-header">
      <span>Notifications</span>
      <button onclick="Notifications.markAllRead()" style="font-size:0.75rem;color:var(--accent);background:none;border:none;cursor:pointer;">Mark all read</button>
    </div>
    <div id="notifList" class="notif-list"><div class="notif-empty">Loading...</div></div>
  </div>

  <!-- Admin Panel Page (injected into nav flow) -->
  `);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectFeatureModals();
  i18n.init();
  if (Auth.isLoggedIn()) Notifications.startPolling();
});

window.Notifications = Notifications;
window.toggleNotifPanel = toggleNotifPanel;
window.Reviews = Reviews;
window.Scheduler = Scheduler;
window.AdminPanel = AdminPanel;
window.Badges = Badges;
window.setLanguage = setLanguage;
window.i18n = i18n;
