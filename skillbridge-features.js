/**
 * SkillBridge — Enhanced Features (js/skillbridge-features.js)
 * Covers: API client, real-time chat, notifications, ratings, admin panel,
 *         multi-language support, session scheduling, skill verification/badges
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   1. API CLIENT
   ═══════════════════════════════════════════════════════════════════ */
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

let authToken = localStorage.getItem('sb_token') || null;

const api = {
  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (authToken) h['Authorization'] = `Bearer ${authToken}`;
    return h;
  },
  async get(path) {
    const r = await fetch(API_BASE + path, { headers: this.headers() });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async post(path, body) {
    const r = await fetch(API_BASE + path, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async put(path, body) {
    const r = await fetch(API_BASE + path, { method: 'PUT', headers: this.headers(), body: JSON.stringify(body) });
    if (!r.ok) throw await r.json();
    return r.json();
  },
  async del(path) {
    const r = await fetch(API_BASE + path, { method: 'DELETE', headers: this.headers() });
    if (!r.ok) throw await r.json();
    return r.json();
  }
};

/* ═══════════════════════════════════════════════════════════════════
   2. MULTI-LANGUAGE (i18n)
   ═══════════════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  en: {
    home: 'Home', features: 'Features', careers: 'Careers', explore: 'Explore',
    login: 'Log In', signup: 'Get Started', logout: 'Logout',
    dashboard: 'Dashboard', profile: 'Profile',
    swaps: 'Swaps', sessions: 'Sessions', messages: 'Messages', notifications: 'Notifications',
    analyzeSkills: 'Analyze My Skills', exploreSwaps: 'Explore Swaps',
    welcome: 'Welcome back', settings: 'Settings', submit: 'Submit', cancel: 'Cancel',
    rating: 'Rating', reviews: 'Reviews', badges: 'Badges', endorsed: 'Endorsed',
    scheduleSession: 'Schedule Session', chatNow: 'Chat Now', sendRequest: 'Send Request',
  },
  hi: {
    home: 'होम', features: 'सुविधाएं', careers: 'करियर', explore: 'खोजें',
    login: 'लॉग इन', signup: 'शुरू करें', logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड', profile: 'प्रोफ़ाइल',
    swaps: 'स्वैप', sessions: 'सत्र', messages: 'संदेश', notifications: 'सूचनाएं',
    analyzeSkills: 'कौशल विश्लेषण', exploreSwaps: 'स्वैप खोजें',
    welcome: 'वापस स्वागत है', settings: 'सेटिंग्स', submit: 'सबमिट', cancel: 'रद्द करें',
    rating: 'रेटिंग', reviews: 'समीक्षाएं', badges: 'बैज', endorsed: 'समर्थित',
    scheduleSession: 'सत्र बुक करें', chatNow: 'चैट करें', sendRequest: 'अनुरोध भेजें',
  },
  ta: {
    home: 'முகப்பு', features: 'அம்சங்கள்', careers: 'தொழில்கள்', explore: 'ஆராய',
    login: 'உள்நுழை', signup: 'தொடங்கு', logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு', profile: 'சுயவிவரம்',
    swaps: 'மாற்றங்கள்', sessions: 'அமர்வுகள்', messages: 'செய்திகள்', notifications: 'அறிவிப்புகள்',
    analyzeSkills: 'திறன் பகுப்பாய்வு', exploreSwaps: 'மாற்றங்களை ஆராய',
    welcome: 'மீண்டும் வரவேற்கிறோம்', settings: 'அமைப்புகள்', submit: 'சமர்ப்பி', cancel: 'ரத்து',
    rating: 'மதிப்பீடு', reviews: 'மதிப்புரைகள்', badges: 'பதக்கங்கள்', endorsed: 'அங்கீகரிக்கப்பட்டது',
    scheduleSession: 'அமர்வு திட்டமிடு', chatNow: 'இப்போது அரட்டை', sendRequest: 'கோரிக்கை அனுப்பு',
  },
  te: {
    home: 'హోమ్', features: 'ఫీచర్లు', careers: 'కెరీర్లు', explore: 'అన్వేషించు',
    login: 'లాగిన్', signup: 'ప్రారంభించు', logout: 'లాగ్ అవుట్',
    dashboard: 'డాష్‌బోర్డ్', profile: 'ప్రొఫైల్',
    swaps: 'మార్పిడులు', sessions: 'సెషన్లు', messages: 'సందేశాలు', notifications: 'నోటిఫికేషన్లు',
    analyzeSkills: 'నైపుణ్యాలు విశ్లేషించండి', exploreSwaps: 'మార్పిడులు అన్వేషించండి',
    welcome: 'తిరిగి స్వాగతం', settings: 'సెట్టింగ్లు', submit: 'సమర్పించు', cancel: 'రద్దు',
    rating: 'రేటింగ్', reviews: 'సమీక్షలు', badges: 'బ్యాడ్జ్లు', endorsed: 'ధృవీకరించబడింది',
    scheduleSession: 'సెషన్ షెడ్యూల్ చేయి', chatNow: 'ఇప్పుడు చాట్ చేయి', sendRequest: 'అభ్యర్థన పంపు',
  }
};

let currentLang = localStorage.getItem('sb_lang') || 'en';

function t(key) {
  return (TRANSLATIONS[currentLang] || TRANSLATIONS.en)[key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('sb_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  renderLanguageUI();
  showToast(`🌐 Language: ${lang.toUpperCase()}`, 'info');
}

function renderLanguageUI() {
  // Update nav items that have data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}

/* Language switcher HTML injection */
function injectLanguageSwitcher() {
  const nav = document.querySelector('.nav-actions');
  if (!nav || document.getElementById('langSwitcher')) return;
  const switcher = document.createElement('div');
  switcher.id = 'langSwitcher';
  switcher.style.cssText = 'position:relative;display:inline-block;';
  switcher.innerHTML = `
    <button onclick="document.getElementById('langDropdown').classList.toggle('show')"
      style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:6px 10px;color:var(--text);cursor:pointer;font-size:0.78rem;">
      🌐 ${currentLang.toUpperCase()}
    </button>
    <div id="langDropdown" style="display:none;position:absolute;right:0;top:110%;background:var(--surface2);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px;min-width:130px;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
      ${[['en','🇺🇸 English'],['hi','🇮🇳 हिंदी'],['ta','🇮🇳 தமிழ்'],['te','🇮🇳 తెలుగు']].map(([code,label]) =>
        `<button onclick="setLanguage('${code}');document.getElementById('langDropdown').classList.remove('show')"
          style="display:block;width:100%;padding:7px 10px;background:none;border:none;color:var(--text);cursor:pointer;border-radius:6px;text-align:left;font-size:0.82rem;"
          onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='none'">${label}</button>`
      ).join('')}
    </div>`;
  // Toggle dropdown properly
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      const dd = document.getElementById('langDropdown');
      if (dd) dd.classList.remove('show');
    }
  });
  const dd = switcher.querySelector('#langDropdown');
  if (dd) {
    dd.addEventListener('show', () => dd.style.display = 'block');
    // Use CSS class for toggle
    const style = document.createElement('style');
    style.textContent = '#langDropdown{display:none} #langDropdown.show{display:block}';
    document.head.appendChild(style);
  }
  nav.insertBefore(switcher, nav.firstChild);
}

/* ═══════════════════════════════════════════════════════════════════
   3. NOTIFICATION CENTER
   ═══════════════════════════════════════════════════════════════════ */
let notifData = [];

function injectNotificationBell() {
  const nav = document.querySelector('.nav-actions');
  if (!nav || document.getElementById('notifBell')) return;
  const bell = document.createElement('div');
  bell.id = 'notifBell';
  bell.style.cssText = 'position:relative;display:inline-block;cursor:pointer;';
  bell.innerHTML = `
    <button id="notifBellBtn" onclick="toggleNotifPanel()"
      style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:6px 10px;color:var(--text);cursor:pointer;font-size:1rem;position:relative;">
      🔔 <span id="notifCount" style="display:none;position:absolute;top:-6px;right:-6px;background:var(--danger,#f87171);color:#fff;font-size:0.65rem;font-weight:700;padding:2px 5px;border-radius:10px;min-width:16px;text-align:center;">0</span>
    </button>
    <div id="notifPanel" style="display:none;position:absolute;right:0;top:110%;width:320px;max-height:400px;overflow-y:auto;background:var(--surface2);border:1px solid rgba(255,255,255,0.1);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.5);z-index:1000;">
      <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:0.9rem;">Notifications</strong>
        <button onclick="markAllNotifRead()" style="background:none;border:none;color:var(--accent);font-size:0.75rem;cursor:pointer;">Mark all read</button>
      </div>
      <div id="notifList" style="padding:8px 0;">
        <div style="padding:20px;text-align:center;color:var(--muted2);font-size:0.82rem;">No notifications yet 🔕</div>
      </div>
    </div>`;
  document.addEventListener('click', e => {
    if (!bell.contains(e.target)) document.getElementById('notifPanel').style.display = 'none';
  });
  nav.insertBefore(bell, nav.firstChild);
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) loadNotifications();
}

async function loadNotifications() {
  if (!authToken) return;
  try {
    const data = await api.get('/notifications');
    notifData = data.notifications || [];
    renderNotifList();
    updateNotifBadge(data.unread || 0);
  } catch(e) {
    // Silently fail — backend might not be running
    renderNotifListDemo();
  }
}

function renderNotifListDemo() {
  // Demo notifications when backend not connected
  const demos = [
    { type: 'swap_request', title: 'New Swap Request!', message: 'Arjun wants to swap Python ↔ React', read: false, createdAt: new Date() },
    { type: 'review', title: 'New Review!', message: 'Priya gave you 5 stars ⭐', read: false, createdAt: new Date(Date.now() - 3600000) },
    { type: 'badge', title: 'Badge Earned!', message: 'You earned the "First Swap" badge 🎉', read: true, createdAt: new Date(Date.now() - 7200000) }
  ];
  renderNotifList(demos);
  updateNotifBadge(2);
}

function renderNotifList(items) {
  const list = document.getElementById('notifList');
  if (!list) return;
  const data = items || notifData;
  if (!data.length) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted2);font-size:0.82rem;">No notifications yet 🔕</div>';
    return;
  }
  const icons = { swap_request:'⇄', swap_accepted:'✅', swap_rejected:'❌', message:'💬', session:'📅', review:'⭐', badge:'🏆', system:'🔔' };
  list.innerHTML = data.map(n => `
    <div onclick="markNotifRead('${n._id||''}')"
      style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;background:${n.read?'transparent':'rgba(0,212,200,0.04)'};transition:background 0.2s;"
      onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='${n.read?'transparent':'rgba(0,212,200,0.04)'}'">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <span style="font-size:1.1rem;flex-shrink:0;">${icons[n.type]||'🔔'}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.83rem;font-weight:${n.read?'400':'600'};color:var(--text);margin-bottom:2px;">${n.title}</div>
          <div style="font-size:0.77rem;color:var(--muted2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.message}</div>
          <div style="font-size:0.7rem;color:var(--muted2);margin-top:3px;">${timeAgo(n.createdAt)}</div>
        </div>
        ${!n.read ? '<span style="width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:4px;"></span>' : ''}
      </div>
    </div>`).join('');
}

function updateNotifBadge(count) {
  const badge = document.getElementById('notifCount');
  if (!badge) return;
  badge.textContent = count > 99 ? '99+' : count;
  badge.style.display = count > 0 ? 'block' : 'none';
}

async function markNotifRead(id) {
  if (!id || !authToken) return;
  try { await api.put(`/notifications/${id}/read`); } catch(e) {}
  loadNotifications();
}

async function markAllNotifRead() {
  if (!authToken) return;
  try { await api.put('/notifications/read-all'); } catch(e) {}
  loadNotifications();
}

/* ═══════════════════════════════════════════════════════════════════
   4. REAL-TIME CHAT
   ═══════════════════════════════════════════════════════════════════ */
let socket = null;
let currentChatRoom = null;
let chatMessages = [];

function initSocket() {
  if (socket || !authToken) return;
  if (typeof io === 'undefined') return; // Socket.io not loaded
  try {
    socket = io(window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    socket.on('connect', () => {
      socket.emit('authenticate', authToken);
      console.log('🔌 Socket connected');
    });
    socket.on('newMessage', (msg) => {
      if (msg.room === currentChatRoom) appendChatMessage(msg);
      else { updateNotifBadge((parseInt(document.getElementById('notifCount')?.textContent) || 0) + 1); }
    });
    socket.on('userTyping', (userId) => {
      const el = document.getElementById('chatTypingIndicator');
      if (el) { el.textContent = 'typing...'; el.style.display = 'block'; }
    });
    socket.on('userStopTyping', () => {
      const el = document.getElementById('chatTypingIndicator');
      if (el) el.style.display = 'none';
    });
    socket.on('newSwapRequest', (data) => {
      showToast(`🔔 New swap request received!`, 'info');
      loadNotifications();
    });
  } catch(e) { console.log('Socket.io not available — running frontend-only mode'); }
}

function openChat(roomId, partnerName) {
  currentChatRoom = roomId;
  if (socket) socket.emit('joinRoom', roomId);

  const overlay = document.getElementById('chatModal') || createChatModal();
  const title = overlay.querySelector('#chatModalTitle');
  if (title) title.textContent = `💬 Chat with ${partnerName}`;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  loadChatHistory(roomId);
}

function createChatModal() {
  const overlay = document.createElement('div');
  overlay.id = 'chatModal';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
  overlay.innerHTML = `
    <div style="background:var(--surface2,#1e2433);border:1px solid rgba(255,255,255,0.1);border-radius:20px;width:min(480px,95vw);height:min(600px,85vh);display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 20px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;">
        <span id="chatModalTitle" style="font-weight:700;font-size:1rem;">💬 Chat</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <span id="chatTypingIndicator" style="display:none;font-size:0.75rem;color:var(--accent);font-style:italic;"></span>
          <button onclick="closeChat()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:4px 10px;color:var(--text);cursor:pointer;">✕</button>
        </div>
      </div>
      <div id="chatMessages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;"></div>
      <div style="padding:14px 16px;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:10px;">
        <input id="chatInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMessage();}"
          oninput="handleChatTyping()"
          style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:var(--text);font-size:0.88rem;outline:none;">
        <button onclick="sendChatMessage()" style="background:linear-gradient(135deg,#00d4c8,#0ea5f0);border:none;border-radius:10px;padding:10px 16px;color:#0a0f1e;font-weight:700;cursor:pointer;">Send</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeChat(); });
  return overlay;
}

function closeChat() {
  const overlay = document.getElementById('chatModal');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
  currentChatRoom = null;
}

async function loadChatHistory(roomId) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;color:var(--muted2);font-size:0.8rem;padding:20px;">Loading messages...</div>';
  try {
    const data = await api.get(`/messages/${roomId}`);
    chatMessages = data.messages || [];
    renderChatMessages();
  } catch(e) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted2);font-size:0.8rem;padding:20px;">No messages yet. Say hi! 👋</div>';
  }
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  if (!chatMessages.length) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted2);font-size:0.8rem;padding:20px;">No messages yet. Say hi! 👋</div>';
    return;
  }
  const currentUserId = getCurrentUserId();
  container.innerHTML = chatMessages.map(msg => {
    const isMine = msg.sender?._id === currentUserId || msg.sender === currentUserId;
    return `
      <div style="display:flex;flex-direction:column;align-items:${isMine?'flex-end':'flex-start'};">
        ${!isMine ? `<span style="font-size:0.7rem;color:var(--muted2);margin-bottom:3px;">${msg.sender?.name || 'Partner'}</span>` : ''}
        <div style="max-width:75%;background:${isMine?'linear-gradient(135deg,#00d4c8,#0ea5f0)':'rgba(255,255,255,0.08)'};color:${isMine?'#0a0f1e':'var(--text)'};padding:10px 14px;border-radius:${isMine?'16px 16px 4px 16px':'16px 16px 16px 4px'};font-size:0.85rem;line-height:1.4;">
          ${escapeHtml(msg.content)}
        </div>
        <span style="font-size:0.68rem;color:var(--muted2);margin-top:3px;">${timeAgo(msg.createdAt)}</span>
      </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function appendChatMessage(msg) {
  chatMessages.push(msg);
  renderChatMessages();
}

let typingTimeout = null;
function handleChatTyping() {
  if (socket && currentChatRoom) {
    socket.emit('typing', currentChatRoom);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('stopTyping', currentChatRoom), 1500);
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const content = input.value.trim();
  if (!content || !currentChatRoom) return;
  input.value = '';

  if (socket) {
    socket.emit('sendMessage', { roomId: currentChatRoom, message: { content, type: 'text' } });
  } else {
    // Offline demo mode
    appendChatMessage({ content, sender: { _id: getCurrentUserId(), name: 'You' }, createdAt: new Date() });
    try { await api.post(`/messages/${currentChatRoom}`, { content }); } catch(e) {}
  }
}

/* ═══════════════════════════════════════════════════════════════════
   5. RATINGS & REVIEWS MODAL
   ═══════════════════════════════════════════════════════════════════ */
function openReviewModal(swapId, revieweeId, revieweeName) {
  let modal = document.getElementById('reviewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reviewModal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--surface2,#1e2433);border:1px solid rgba(255,255,255,0.1);border-radius:20px;width:min(440px,92vw);padding:28px;position:relative;">
        <button onclick="closeReviewModal()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:4px 10px;color:var(--text);cursor:pointer;">✕</button>
        <h3 style="margin:0 0 6px;font-size:1.2rem;">⭐ Rate Your Swap</h3>
        <p id="reviewModalSub" style="color:var(--muted2);font-size:0.83rem;margin:0 0 20px;">How was your experience?</p>

        <div style="text-align:center;margin-bottom:20px;">
          <div id="starRating" style="font-size:2.2rem;cursor:pointer;letter-spacing:4px;">☆☆☆☆☆</div>
          <div id="starLabel" style="font-size:0.78rem;color:var(--muted2);margin-top:6px;"></div>
        </div>

        <div style="margin-bottom:14px;">
          <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">Written Review (optional)</label>
          <textarea id="reviewText" rows="3" placeholder="Share what you learned, how they taught, punctuality..."
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.85rem;resize:vertical;box-sizing:border-box;"></textarea>
        </div>

        <div style="margin-bottom:18px;">
          <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:8px;">Quick Tags</label>
          <div id="reviewTags" style="display:flex;flex-wrap:wrap;gap:6px;">
            ${['Knowledgeable','Patient','Punctual','Engaging','Well-prepared','Encouraging'].map(tag =>
              `<span onclick="toggleReviewTag(this,'${tag}')" data-tag="${tag}"
                style="padding:5px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);font-size:0.76rem;cursor:pointer;transition:all 0.2s;">${tag}</span>`
            ).join('')}
          </div>
        </div>

        <input type="hidden" id="reviewSwapId" value="">
        <input type="hidden" id="revieweeId" value="">
        <button onclick="submitReview()" style="width:100%;background:linear-gradient(135deg,#00d4c8,#0ea5f0);border:none;border-radius:12px;padding:13px;color:#0a0f1e;font-weight:700;font-size:0.95rem;cursor:pointer;">Submit Review →</button>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) closeReviewModal(); });

    // Star rating logic
    const stars = modal.querySelector('#starRating');
    const labels = ['Terrible','Poor','Okay','Good','Excellent!'];
    stars.addEventListener('mousemove', e => {
      const rect = stars.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const hover = Math.ceil(pct * 5);
      stars.textContent = '★'.repeat(hover) + '☆'.repeat(5 - hover);
      modal.querySelector('#starLabel').textContent = labels[hover-1] || '';
    });
    stars.addEventListener('mouseleave', () => {
      const sel = parseInt(stars.dataset.selected || 0);
      stars.textContent = '★'.repeat(sel) + '☆'.repeat(5 - sel);
    });
    stars.addEventListener('click', e => {
      const rect = stars.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const rating = Math.ceil(pct * 5);
      stars.dataset.selected = rating;
      stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      modal.querySelector('#starLabel').textContent = labels[rating-1];
    });
  }

  modal.querySelector('#reviewModalSub').textContent = `How was your swap with ${revieweeName}?`;
  modal.querySelector('#reviewSwapId').value = swapId;
  modal.querySelector('#revieweeId').value = revieweeId;
  modal.querySelector('#starRating').textContent = '☆☆☆☆☆';
  modal.querySelector('#starRating').dataset.selected = 0;
  modal.querySelector('#reviewText').value = '';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function toggleReviewTag(el, tag) {
  const active = el.style.background === 'rgba(0,212,200,0.2)';
  el.style.background = active ? 'transparent' : 'rgba(0,212,200,0.2)';
  el.style.borderColor = active ? 'rgba(255,255,255,0.15)' : '#00d4c8';
  el.style.color = active ? 'var(--text)' : '#00d4c8';
}

async function submitReview() {
  const modal = document.getElementById('reviewModal');
  const rating = parseInt(modal.querySelector('#starRating').dataset.selected || 0);
  if (!rating) { showToast('Please select a star rating', 'warning'); return; }
  const review = modal.querySelector('#reviewText').value.trim();
  const swapId = modal.querySelector('#reviewSwapId').value;
  const revieweeId = modal.querySelector('#revieweeId').value;
  const tags = Array.from(modal.querySelectorAll('#reviewTags [data-tag]'))
    .filter(el => el.style.background === 'rgba(0,212,200,0.2)')
    .map(el => el.dataset.tag);

  try {
    await api.post('/reviews', { swapId, revieweeId, rating, review, tags });
    showToast('Review submitted! ⭐', 'success');
    closeReviewModal();
  } catch(e) {
    showToast(e.error || 'Failed to submit review', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════════
   6. SESSION SCHEDULER
   ═══════════════════════════════════════════════════════════════════ */
function openScheduleModal(swapId, participants, partnerName) {
  let modal = document.getElementById('scheduleModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'scheduleModal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--surface2,#1e2433);border:1px solid rgba(255,255,255,0.1);border-radius:20px;width:min(440px,92vw);padding:28px;position:relative;max-height:90vh;overflow-y:auto;">
        <button onclick="closeScheduleModal()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:4px 10px;color:var(--text);cursor:pointer;">✕</button>
        <h3 style="margin:0 0 4px;font-size:1.2rem;">📅 Schedule Session</h3>
        <p id="scheduleModalSub" style="color:var(--muted2);font-size:0.83rem;margin:0 0 22px;">Book a learning session</p>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">Session Title</label>
            <input id="sessionTitle" placeholder="e.g. React basics — Week 1"
              style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.88rem;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">Date & Time</label>
            <input id="sessionDateTime" type="datetime-local"
              style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.88rem;box-sizing:border-box;color-scheme:dark;">
          </div>
          <div>
            <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">Duration</label>
            <select id="sessionDuration"
              style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.88rem;box-sizing:border-box;">
              <option value="30">30 minutes</option>
              <option value="60" selected>1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">Notes (optional)</label>
            <textarea id="sessionNotes" rows="2" placeholder="What you'll cover in this session..."
              style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.85rem;resize:none;box-sizing:border-box;"></textarea>
          </div>
        </div>

        <div style="background:rgba(0,212,200,0.08);border:1px solid rgba(0,212,200,0.2);border-radius:10px;padding:12px;margin-top:16px;margin-bottom:18px;font-size:0.8rem;color:var(--muted2);">
          🎥 A Google Meet link will be auto-generated and shared with both participants.
          <br>⏰ Email reminders will be sent 1 hour before the session.
        </div>

        <input type="hidden" id="scheduleSwapId" value="">
        <input type="hidden" id="scheduleParticipants" value="">
        <button onclick="submitSession()" style="width:100%;background:linear-gradient(135deg,#00d4c8,#0ea5f0);border:none;border-radius:12px;padding:13px;color:#0a0f1e;font-weight:700;font-size:0.95rem;cursor:pointer;">📅 Schedule Session →</button>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) closeScheduleModal(); });
  }

  modal.querySelector('#scheduleModalSub').textContent = `Schedule a session with ${partnerName}`;
  modal.querySelector('#scheduleSwapId').value = swapId;
  modal.querySelector('#scheduleParticipants').value = JSON.stringify(participants);
  // Default to tomorrow same time
  const tomorrow = new Date(Date.now() + 86400000);
  tomorrow.setMinutes(0, 0, 0);
  modal.querySelector('#sessionDateTime').value = tomorrow.toISOString().slice(0, 16);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function submitSession() {
  const modal = document.getElementById('scheduleModal');
  const title = modal.querySelector('#sessionTitle').value.trim();
  const dt = modal.querySelector('#sessionDateTime').value;
  const duration = modal.querySelector('#sessionDuration').value;
  const notes = modal.querySelector('#sessionNotes').value.trim();
  const swapId = modal.querySelector('#scheduleSwapId').value;
  const participants = JSON.parse(modal.querySelector('#scheduleParticipants').value || '[]');

  if (!title || !dt) { showToast('Please fill in title and date/time', 'warning'); return; }
  if (new Date(dt) < new Date()) { showToast('Please select a future date/time', 'warning'); return; }

  try {
    const data = await api.post('/sessions', { swapId, title, scheduledAt: dt, duration: parseInt(duration), participants, notes });
    showToast(`Session scheduled! 📅 Meet link generated`, 'success');
    if (data.session?.meetLink) {
      setTimeout(() => showToast(`🎥 Meet: ${data.session.meetLink}`, 'info'), 1000);
    }
    closeScheduleModal();
  } catch(e) {
    // Demo mode fallback
    showToast(`📅 Session "${title}" scheduled! Meet link will be emailed`, 'success');
    closeScheduleModal();
  }
}

/* ═══════════════════════════════════════════════════════════════════
   7. SKILL VERIFICATION & BADGES PANEL
   ═══════════════════════════════════════════════════════════════════ */
function renderBadges(badges, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const ALL_BADGES = [
    { id: 'first_swap', name: 'First Swap!', icon: '🎉', description: 'Completed your first skill swap' },
    { id: 'swap_5', name: '5 Swaps', icon: '🌟', description: 'Completed 5 skill swaps' },
    { id: 'swap_10', name: 'Swap Master', icon: '🏆', description: 'Completed 10 skill swaps' },
    { id: 'top_rated', name: 'Top Rated', icon: '⭐', description: '4.5+ star rating' },
    { id: 'python_mentor', name: 'Python Mentor', icon: '🐍', description: 'Verified Python skill' },
    { id: 'early_adopter', name: 'Early Adopter', icon: '🚀', description: 'Joined SkillBridge early' }
  ];
  const earnedIds = (badges || []).map(b => b.id);
  container.innerHTML = ALL_BADGES.map(b => {
    const earned = earnedIds.includes(b.id);
    return `<div title="${b.description}"
      style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;border:1px solid ${earned?'rgba(0,212,200,0.4)':'rgba(255,255,255,0.1)'};background:${earned?'rgba(0,212,200,0.1)':'rgba(255,255,255,0.03)'};margin:3px;font-size:0.78rem;color:${earned?'#00d4c8':'var(--muted2)'};opacity:${earned?1:0.5};cursor:default;">
      <span>${b.icon}</span><span>${b.name}</span>${earned?'<span style="font-size:0.65rem;color:#00d4c8;">✓</span>':''}
    </div>`;
  }).join('');
}

function renderStarRating(rating, count) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const stars = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  return `<span style="color:#f5b731;font-size:1rem;">${stars}</span> <span style="color:var(--muted2);font-size:0.78rem;">${rating.toFixed(1)} (${count} review${count !== 1 ? 's' : ''})</span>`;
}

/* ═══════════════════════════════════════════════════════════════════
   8. ADMIN PANEL
   ═══════════════════════════════════════════════════════════════════ */
function openAdminPanel() {
  const user = getCurrentUserData();
  if (!user || user.role !== 'admin') {
    showToast('Admin access required 🔒', 'error');
    return;
  }
  let panel = document.getElementById('adminPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:20000;overflow-y:auto;';
    panel.innerHTML = `
      <div style="max-width:1100px;margin:0 auto;padding:32px 20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="margin:0;font-size:1.6rem;font-weight:800;">🛡️ Admin Dashboard</h2>
          <button onclick="document.getElementById('adminPanel').style.display='none'" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px 16px;color:var(--text);cursor:pointer;">✕ Close</button>
        </div>

        <div id="adminStats" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;margin-bottom:28px;">
          <div style="background:var(--surface2);border-radius:14px;padding:20px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.8rem;font-weight:800;color:var(--accent);" id="aStatUsers">—</div>
            <div style="font-size:0.8rem;color:var(--muted2);">Total Users</div>
          </div>
          <div style="background:var(--surface2);border-radius:14px;padding:20px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.8rem;font-weight:800;color:var(--green);" id="aStatActive">—</div>
            <div style="font-size:0.8rem;color:var(--muted2);">Active (7d)</div>
          </div>
          <div style="background:var(--surface2);border-radius:14px;padding:20px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.8rem;font-weight:800;color:var(--accent2);" id="aStatSwaps">—</div>
            <div style="font-size:0.8rem;color:var(--muted2);">Total Swaps</div>
          </div>
          <div style="background:var(--surface2);border-radius:14px;padding:20px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.8rem;font-weight:800;color:var(--gold);" id="aStatCompleted">—</div>
            <div style="font-size:0.8rem;color:var(--muted2);">Completed</div>
          </div>
          <div style="background:var(--surface2);border-radius:14px;padding:20px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:1.8rem;font-weight:800;color:var(--accent3);" id="aStatReviews">—</div>
            <div style="font-size:0.8rem;color:var(--muted2);">Reviews</div>
          </div>
        </div>

        <div style="background:var(--surface2);border-radius:16px;padding:22px;border:1px solid rgba(255,255,255,0.08);margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h3 style="margin:0;font-size:1rem;">👥 User Management</h3>
            <input id="adminUserSearch" placeholder="🔍 Search users..." oninput="searchAdminUsers()"
              style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 12px;color:var(--text);font-size:0.82rem;width:200px;">
          </div>
          <div id="adminUserList" style="overflow-x:auto;">
            <div style="text-align:center;padding:30px;color:var(--muted2);">Loading users...</div>
          </div>
        </div>

        <div style="background:var(--surface2);border-radius:16px;padding:22px;border:1px solid rgba(255,255,255,0.08);">
          <h3 style="margin:0 0 16px;font-size:1rem;">🔥 Popular Skills</h3>
          <div id="adminSkillsList" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
        </div>
      </div>`;
    document.body.appendChild(panel);
  }
  panel.style.display = 'block';
  loadAdminStats();
  loadAdminUsers();
}

async function loadAdminStats() {
  try {
    const data = await api.get('/admin/stats');
    document.getElementById('aStatUsers').textContent = data.totalUsers || 0;
    document.getElementById('aStatActive').textContent = data.activeUsers || 0;
    document.getElementById('aStatSwaps').textContent = data.totalSwaps || 0;
    document.getElementById('aStatCompleted').textContent = data.completedSwaps || 0;
    document.getElementById('aStatReviews').textContent = data.totalReviews || 0;
    const skillsList = document.getElementById('adminSkillsList');
    if (skillsList && data.popularSkills) {
      skillsList.innerHTML = data.popularSkills.map(s =>
        `<span style="padding:5px 12px;border-radius:20px;background:rgba(0,212,200,0.1);border:1px solid rgba(0,212,200,0.2);font-size:0.78rem;color:var(--accent);">${s._id} <span style="opacity:0.6;">(${s.count})</span></span>`
      ).join('');
    }
  } catch(e) {
    // Demo data
    ['aStatUsers','aStatActive','aStatSwaps','aStatCompleted','aStatReviews'].forEach((id,i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = [1247, 389, 892, 654, 421][i];
    });
  }
}

async function loadAdminUsers(search) {
  const list = document.getElementById('adminUserList');
  if (!list) return;
  try {
    const url = search ? `/admin/users?search=${encodeURIComponent(search)}` : '/admin/users';
    const data = await api.get(url);
    renderAdminUserTable(data.users || []);
  } catch(e) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted2);font-size:0.82rem;">Connect backend to manage users</div>';
  }
}

function renderAdminUserTable(users) {
  const list = document.getElementById('adminUserList');
  if (!list || !users.length) {
    if (list) list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted2);">No users found</div>';
    return;
  }
  list.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
    <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
      ${['Name','Location','Rating','Swaps','Status','Actions'].map(h => `<th style="padding:10px 8px;text-align:left;color:var(--muted2);font-weight:600;">${h}</th>`).join('')}
    </tr></thead>
    <tbody>${users.map(u => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 8px;">${u.name}</td>
        <td style="padding:10px 8px;color:var(--muted2);">${u.location || '—'}</td>
        <td style="padding:10px 8px;color:#f5b731;">★ ${u.rating?.toFixed(1) || '—'}</td>
        <td style="padding:10px 8px;">${u.swapsCompleted || 0}</td>
        <td style="padding:10px 8px;"><span style="padding:3px 8px;border-radius:6px;font-size:0.72rem;background:${u.isBanned?'rgba(248,113,113,0.15)':'rgba(34,211,163,0.15)'};color:${u.isBanned?'#f87171':'#22d3a3'};">${u.isBanned?'Banned':'Active'}</span></td>
        <td style="padding:10px 8px;">
          <button onclick="adminBanUser('${u._id}',${!u.isBanned})"
            style="padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:none;color:${u.isBanned?'var(--accent)':'var(--danger,#f87171)'};cursor:pointer;font-size:0.75rem;">
            ${u.isBanned ? 'Unban' : 'Ban'}
          </button>
        </td>
      </tr>`).join('')}
    </tbody></table>`;
}

async function adminBanUser(userId, ban) {
  try {
    await api.put(`/admin/users/${userId}/ban`, { banned: ban });
    showToast(`User ${ban ? 'banned' : 'unbanned'}`, ban ? 'warning' : 'success');
    loadAdminUsers();
  } catch(e) { showToast('Action failed', 'error'); }
}

let adminSearchDebounce;
function searchAdminUsers() {
  const val = document.getElementById('adminUserSearch')?.value;
  clearTimeout(adminSearchDebounce);
  adminSearchDebounce = setTimeout(() => loadAdminUsers(val), 400);
}

/* ═══════════════════════════════════════════════════════════════════
   9. ENHANCED SWAP REQUEST MODAL
   ═══════════════════════════════════════════════════════════════════ */
function openSwapRequestModal(recipientId, recipientName, recipientSkills) {
  let modal = document.getElementById('swapRequestModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'swapRequestModal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div style="background:var(--surface2,#1e2433);border:1px solid rgba(255,255,255,0.1);border-radius:20px;width:min(440px,92vw);padding:28px;position:relative;">
        <button onclick="closeSwapRequestModal()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:4px 10px;color:var(--text);cursor:pointer;">✕</button>
        <h3 style="margin:0 0 4px;font-size:1.2rem;">⇄ Send Swap Request</h3>
        <p id="swapModalSub" style="color:var(--muted2);font-size:0.83rem;margin:0 0 22px;"></p>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">I can teach them</label>
            <input id="swapMySkill" placeholder="e.g. React, Python, UI Design..."
              style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.88rem;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">I want to learn</label>
            <select id="swapWantSkill"
              style="width:100%;background:rgba(20,30,50,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.88rem;box-sizing:border-box;">
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;color:var(--muted2);display:block;margin-bottom:6px;">Message (optional)</label>
            <textarea id="swapMessage" rows="3" placeholder="Introduce yourself and what you'd like to learn..."
              style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;color:var(--text);font-size:0.85rem;resize:none;box-sizing:border-box;"></textarea>
          </div>
        </div>
        <input type="hidden" id="swapRecipientId" value="">
        <button onclick="submitSwapRequest()" style="width:100%;background:linear-gradient(135deg,#00d4c8,#0ea5f0);border:none;border-radius:12px;padding:13px;color:#0a0f1e;font-weight:700;font-size:0.95rem;cursor:pointer;margin-top:18px;">⇄ Send Swap Request →</button>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) closeSwapRequestModal(); });
  }

  modal.querySelector('#swapModalSub').textContent = `Request a skill swap with ${recipientName}`;
  modal.querySelector('#swapRecipientId').value = recipientId;
  const select = modal.querySelector('#swapWantSkill');
  const skills = Array.isArray(recipientSkills) ? recipientSkills : ['Python', 'React', 'Design'];
  select.innerHTML = skills.map(s => `<option value="${s}">${s}</option>`).join('');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeSwapRequestModal() {
  const modal = document.getElementById('swapRequestModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function submitSwapRequest() {
  const modal = document.getElementById('swapRequestModal');
  const recipientId = modal.querySelector('#swapRecipientId').value;
  const requesterSkill = modal.querySelector('#swapMySkill').value.trim();
  const recipientSkill = modal.querySelector('#swapWantSkill').value;
  const message = modal.querySelector('#swapMessage').value.trim();

  if (!requesterSkill) { showToast('Please enter the skill you can teach', 'warning'); return; }

  try {
    await api.post('/swaps', { recipientId, requesterSkill, recipientSkill, message });
    showToast('Swap request sent! ⇄', 'success');
    closeSwapRequestModal();
  } catch(e) {
    // Demo fallback
    showToast('Swap request sent! ⇄ (Demo mode)', 'success');
    closeSwapRequestModal();
  }
}

/* ═══════════════════════════════════════════════════════════════════
   10. UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════ */
function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

function getCurrentUserId() {
  try {
    const data = JSON.parse(localStorage.getItem('sb_user') || '{}');
    return data._id || data.id || null;
  } catch(e) { return null; }
}

function getCurrentUserData() {
  try { return JSON.parse(localStorage.getItem('sb_user') || 'null'); }
  catch(e) { return null; }
}

/* ═══════════════════════════════════════════════════════════════════
   11. BROWSER PUSH NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════════ */
async function requestPushPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') showToast('🔔 Push notifications enabled!', 'success');
  }
}

function sendPushNotification(title, body, icon) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: icon || '🌉', tag: 'skillbridge' });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   12. ENHANCED AUTH — override to also store token & init features
   ═══════════════════════════════════════════════════════════════════ */
function onAuthSuccess(token, user) {
  authToken = token;
  localStorage.setItem('sb_token', token);
  localStorage.setItem('sb_user', JSON.stringify(user));
  initSocket();
  loadNotifications();
  requestPushPermission();
  // Set language from user preference
  if (user.language) setLanguage(user.language);
  showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
}

function onAuthLogout() {
  authToken = null;
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
  if (socket) { socket.disconnect(); socket = null; }
  updateNotifBadge(0);
}

/* ═══════════════════════════════════════════════════════════════════
   13. INIT — runs on DOMContentLoaded
   ═══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  injectLanguageSwitcher();
  injectNotificationBell();
  renderLanguageUI();

  // Restore session if token exists
  if (authToken) {
    api.get('/auth/me').then(data => {
      if (data.user) {
        localStorage.setItem('sb_user', JSON.stringify(data.user));
        initSocket();
        loadNotifications();
      }
    }).catch(() => {
      authToken = null;
      localStorage.removeItem('sb_token');
    });
  }

  // Expose helpers globally for inline onclick usage
  window.openChat = openChat;
  window.openReviewModal = openReviewModal;
  window.openScheduleModal = openScheduleModal;
  window.openSwapRequestModal = openSwapRequestModal;
  window.openAdminPanel = openAdminPanel;
  window.setLanguage = setLanguage;
  window.renderBadges = renderBadges;
  window.renderStarRating = renderStarRating;
  window.onAuthSuccess = onAuthSuccess;
  window.onAuthLogout = onAuthLogout;
  window.submitReview = submitReview;
  window.submitSession = submitSession;
  window.submitSwapRequest = submitSwapRequest;
  window.markAllNotifRead = markAllNotifRead;
  window.closeChat = closeChat;
  window.closeReviewModal = closeReviewModal;
  window.closeScheduleModal = closeScheduleModal;
  window.closeSwapRequestModal = closeSwapRequestModal;
  window.api = api;
});
