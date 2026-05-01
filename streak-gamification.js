// ============================================================
// SkillBridge — Streak & Gamification System v1.0
// Tracks learning streaks, awards badges, fires confetti
// Integrates with: analyzeSkills() + handleSchedule()
// ============================================================

/* ─── STORAGE KEYS ─────────────────────────────────────────── */
const STREAK_KEY   = 'skillbridge-streak';
const BADGES_KEY   = 'skillbridge-badges';

/* ─── BADGE DEFINITIONS ───────────────────────────────────── */
const BADGE_CATALOG = [
  // Streak badges
  { id: 'streak-3',    icon: '🔥',  name: 'On Fire',         desc: '3-day learning streak',        color: '#f97316', type: 'streak',   threshold: 3   },
  { id: 'streak-7',    icon: '⚡',  name: 'Week Warrior',    desc: '7-day learning streak',        color: '#f5b731', type: 'streak',   threshold: 7   },
  { id: 'streak-14',   icon: '💎',  name: 'Diamond Focus',   desc: '14-day learning streak',       color: '#00d4c8', type: 'streak',   threshold: 14  },
  { id: 'streak-30',   icon: '👑',  name: 'Streak Legend',   desc: '30-day legendary streak',      color: '#7c5cfc', type: 'streak',   threshold: 30  },

  // Analysis badges
  { id: 'first-scan',  icon: '🔍',  name: 'Self-Aware',      desc: 'Completed first skill scan',   color: '#0ea5f0', type: 'action'                   },
  { id: 'scan-5',      icon: '🧠',  name: 'Deep Diver',      desc: '5 skill analyses done',        color: '#22d3a3', type: 'action',   threshold: 5   },
  { id: 'scan-10',     icon: '🎓',  name: 'Growth Mindset',  desc: '10 skill analyses done',       color: '#7c5cfc', type: 'action',   threshold: 10  },

  // Session badges
  { id: 'first-book',  icon: '📅',  name: 'First Swap',      desc: 'Booked first swap session',    color: '#f5b731', type: 'session'                  },
  { id: 'session-5',   icon: '🤝',  name: 'Connector',       desc: '5 swap sessions booked',       color: '#00d4c8', type: 'session',  threshold: 5   },
  { id: 'session-10',  icon: '🌟',  name: 'Skill Champion',  desc: '10 swap sessions booked',      color: '#f97316', type: 'session',  threshold: 10  },

  // Combo badge
  { id: 'combo-scan-session', icon: '🚀', name: 'Full Stack Learner', desc: 'Analyzed skills & booked a session in same day', color: '#7c5cfc', type: 'combo' },
];

/* ─── STREAK DATA HELPERS ─────────────────────────────────── */
function loadStreakData() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) || {
      current: 0, longest: 0, lastActive: null,
      totalAnalyses: 0, totalSessions: 0,
      todayAnalyzed: false, todaySession: false,
      lastComboDate: null
    };
  } catch { return { current: 0, longest: 0, lastActive: null, totalAnalyses: 0, totalSessions: 0, todayAnalyzed: false, todaySession: false, lastComboDate: null }; }
}

function saveStreakData(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function loadBadges() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY)) || []; }
  catch { return []; }
}

function saveBadges(badges) {
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/* ─── STREAK LOGIC ────────────────────────────────────────── */
function updateStreak(data) {
  const today = todayStr();
  if (data.lastActive === today) return data; // Already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];

  if (data.lastActive === yStr) {
    data.current += 1;
  } else if (data.lastActive === null) {
    data.current = 1;
  } else {
    // Gap of 2+ days — reset streak
    data.current = 1;
  }

  data.lastActive = today;
  data.longest = Math.max(data.longest, data.current);
  // Reset daily flags on new day
  data.todayAnalyzed = false;
  data.todaySession = false;
  return data;
}

/* ─── BADGE AWARD ENGINE ──────────────────────────────────── */
function checkAndAwardBadges(data) {
  const earned = loadBadges();
  const earnedIds = new Set(earned.map(b => b.id));
  const newBadges = [];

  BADGE_CATALOG.forEach(badge => {
    if (earnedIds.has(badge.id)) return;
    let award = false;

    if (badge.type === 'streak') {
      award = data.current >= badge.threshold;
    } else if (badge.type === 'action') {
      if (!badge.threshold) award = data.totalAnalyses >= 1;
      else award = data.totalAnalyses >= badge.threshold;
    } else if (badge.type === 'session') {
      if (!badge.threshold) award = data.totalSessions >= 1;
      else award = data.totalSessions >= badge.threshold;
    } else if (badge.type === 'combo') {
      award = data.todayAnalyzed && data.todaySession;
    }

    if (award) {
      const badgeWithDate = Object.assign({}, badge, { earnedAt: new Date().toISOString() });
      earned.push(badgeWithDate);
      newBadges.push(badgeWithDate);
    }
  });

  if (newBadges.length > 0) saveBadges(earned);
  return newBadges;
}

/* ─── CONFETTI ENGINE ─────────────────────────────────────── */
function launchConfetti(intensity = 'medium') {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#00d4c8','#f5b731','#7c5cfc','#0ea5f0','#22d3a3','#f97316','#ffffff'];
  const count  = intensity === 'epic' ? 200 : intensity === 'high' ? 120 : 70;
  const pieces = [];

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      r: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      vr: (Math.random() - 0.5) * 0.2,
      angle: Math.random() * Math.PI * 2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      alpha: 1
    });
  }

  let frame = 0;
  const maxFrames = 160;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.angle += p.vr;
      p.vy += 0.08;
      if (frame > maxFrames * 0.6) p.alpha -= 0.025;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      } else {
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });
    frame++;
    if (frame < maxFrames) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
  }
  requestAnimationFrame(draw);
}

/* ─── MILESTONE TOAST ─────────────────────────────────────── */
function showStreakToast(streak) {
  const el = document.getElementById('streak-toast');
  if (!el) return;
  const flames = streak >= 30 ? '🔥🔥🔥' : streak >= 14 ? '🔥🔥' : '🔥';
  el.querySelector('.st-flames').textContent = flames;
  el.querySelector('.st-count').textContent = streak + '-Day Streak!';
  el.querySelector('.st-msg').textContent = streak >= 30 ? 'Legendary. You are unstoppable.' :
    streak >= 14 ? 'Two weeks of mastery. Keep going!' :
    streak >= 7  ? 'A full week! You\'re on a roll.' :
    streak >= 3  ? 'Three days strong. Build the habit!' :
    'Day ' + streak + ' — keep showing up!';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

/* ─── BADGE NOTIFICATION ──────────────────────────────────── */
function showBadgeUnlock(badge) {
  const el = document.getElementById('badge-unlock-toast');
  if (!el) return;
  el.querySelector('.bu-icon').textContent  = badge.icon;
  el.querySelector('.bu-name').textContent  = badge.name;
  el.querySelector('.bu-desc').textContent  = badge.desc;
  el.querySelector('.bu-icon').style.background = badge.color + '22';
  el.querySelector('.bu-icon').style.border = '2px solid ' + badge.color;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 5000);
}

/* ─── PUBLIC API: called from mapmyskills-app.js ──────────── */
function onSkillAnalyzed() {
  let data = loadStreakData();
  data = updateStreak(data);
  data.totalAnalyses += 1;
  data.todayAnalyzed = true;
  saveStreakData(data);

  // Fire streak toast at milestone streaks
  const milestones = [3, 7, 14, 30];
  if (milestones.includes(data.current)) {
    setTimeout(() => {
      showStreakToast(data.current);
      launchConfetti(data.current >= 30 ? 'epic' : data.current >= 14 ? 'high' : 'medium');
    }, 800);
  } else if (data.current > 1) {
    setTimeout(() => showStreakToast(data.current), 600);
  }

  // Check badges
  const newBadges = checkAndAwardBadges(data);
  newBadges.forEach((badge, i) => {
    setTimeout(() => {
      showBadgeUnlock(badge);
      if (i === 0) launchConfetti('medium');
    }, 1200 + i * 2500);
  });

  refreshStreakUI();
}

/* ─── PUBLIC API: called from skillswap.js ────────────────── */
function onSessionBooked() {
  let data = loadStreakData();
  data = updateStreak(data);
  data.totalSessions += 1;
  data.todaySession = true;
  saveStreakData(data);

  const newBadges = checkAndAwardBadges(data);
  newBadges.forEach((badge, i) => {
    setTimeout(() => {
      showBadgeUnlock(badge);
      launchConfetti('medium');
    }, 500 + i * 2500);
  });

  refreshStreakUI();
}

/* ─── RENDER: Streak Widget on Dashboard ─────────────────── */
function renderStreakWidget() {
  const container = document.getElementById('streak-widget');
  if (!container) return;
  const data = loadStreakData();
  const badges = loadBadges();

  const pct = Math.min((data.current / 30) * 100, 100);
  const nextMilestone = [3,7,14,30].find(m => m > data.current) || 30;
  const daysToNext = nextMilestone - data.current;

  // Flame color gradient based on streak
  const flameColor = data.current >= 30 ? '#7c5cfc' :
                     data.current >= 14 ? '#00d4c8' :
                     data.current >= 7  ? '#f5b731' :
                     data.current >= 3  ? '#f97316' : 'var(--muted2)';

  container.innerHTML = `
    <div class="streak-header">
      <div class="streak-flame-block">
        <div class="streak-flame" style="color:${flameColor}" id="streak-flame-emoji">
          ${data.current >= 7 ? '🔥' : data.current >= 3 ? '🔥' : '💤'}
        </div>
        <div>
          <div class="streak-number" style="color:${flameColor}">${data.current}</div>
          <div class="streak-label">Day Streak</div>
        </div>
      </div>
      <div class="streak-meta">
        <div class="streak-meta-item"><span class="streak-meta-val">${data.longest}</span><span class="streak-meta-key">Best</span></div>
        <div class="streak-meta-item"><span class="streak-meta-val">${data.totalAnalyses}</span><span class="streak-meta-key">Scans</span></div>
        <div class="streak-meta-item"><span class="streak-meta-val">${data.totalSessions}</span><span class="streak-meta-key">Sessions</span></div>
      </div>
    </div>

    <div class="streak-bar-wrap">
      <div class="streak-bar-track">
        <div class="streak-bar-fill" style="width:${pct}%;background:${flameColor};"></div>
      </div>
      <div class="streak-bar-labels">
        <span style="color:var(--muted2);font-size:0.72rem;">0</span>
        <span style="color:var(--muted2);font-size:0.72rem;flex:1;text-align:center;">${daysToNext > 0 ? daysToNext + ' days to ' + nextMilestone + '-day badge' : '🏆 Max streak reached!'}</span>
        <span style="color:var(--muted2);font-size:0.72rem;">30</span>
      </div>
    </div>

    ${badges.length > 0 ? `
    <div class="streak-badges-section">
      <div class="streak-badges-title">🏅 Earned Badges <span class="badge-count">${badges.length}</span></div>
      <div class="streak-badges-grid">
        ${badges.map(b => `
          <div class="streak-badge-chip" title="${b.name}: ${b.desc}" style="--bc:${b.color}">
            <span>${b.icon}</span>
            <span class="sbc-name">${b.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : `
    <div class="streak-empty-badges">
      <span style="opacity:0.4;">No badges yet — analyze skills or book a session to earn your first! 🎯</span>
    </div>
    `}
  `;

  // Pulse animation on flame if streak active
  if (data.current >= 3) {
    const flame = container.querySelector('#streak-flame-emoji');
    if (flame) flame.classList.add('flame-pulse');
  }
}

/* ─── RENDER: Compact streak pill for profile sidebar ─────── */
function renderStreakPill() {
  const pill = document.getElementById('streak-pill');
  if (!pill) return;
  const data = loadStreakData();
  const color = data.current >= 14 ? '#00d4c8' : data.current >= 7 ? '#f5b731' : data.current >= 3 ? '#f97316' : 'var(--muted2)';
  pill.innerHTML = `
    <span style="font-size:1.1rem;">${data.current >= 3 ? '🔥' : '💤'}</span>
    <span style="font-family:var(--font-head);font-weight:800;font-size:1rem;color:${color};">${data.current}</span>
    <span style="font-size:0.7rem;color:var(--muted2);line-height:1;">day<br>streak</span>
  `;
}

/* ─── REFRESH ALL STREAK UI ───────────────────────────────── */
function refreshStreakUI() {
  renderStreakWidget();
  renderStreakPill();
}

/* ─── INIT: Add HTML scaffolding & run on load ────────────── */
function initStreakSystem() {
  // Inject confetti canvas
  if (!document.getElementById('confetti-canvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;display:none;';
    document.body.appendChild(canvas);
  }

  // Inject streak toast
  if (!document.getElementById('streak-toast')) {
    const el = document.createElement('div');
    el.id = 'streak-toast';
    el.className = 'streak-toast';
    el.innerHTML = `
      <div class="st-inner">
        <div class="st-flames">🔥</div>
        <div class="st-text">
          <div class="st-count">3-Day Streak!</div>
          <div class="st-msg">Keep showing up!</div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
  }

  // Inject badge unlock toast
  if (!document.getElementById('badge-unlock-toast')) {
    const el = document.createElement('div');
    el.id = 'badge-unlock-toast';
    el.className = 'badge-unlock-toast';
    el.innerHTML = `
      <div class="bu-inner">
        <div class="bu-label">🏅 Badge Unlocked!</div>
        <div class="bu-row">
          <div class="bu-icon">🔥</div>
          <div class="bu-details">
            <div class="bu-name">Badge Name</div>
            <div class="bu-desc">Badge description</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
  }

  refreshStreakUI();
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  initStreakSystem();
});
