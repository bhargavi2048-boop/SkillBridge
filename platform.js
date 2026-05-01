/* ════════════════════════════════════════
   SKILLPRO — Platform Controller JS
   Unified navigation for MapMySkills × SkillSwap
════════════════════════════════════════ */
'use strict';

let currentPlatform = 'mapmyskills';

/* ─── PLATFORM SWITCH ─── */
function switchPlatform(platform, page) {
  currentPlatform = platform;
  const ptgMap = document.getElementById('ptgMap');
  const ptgSwap = document.getElementById('ptgSwap');

  if (platform === 'mapmyskills') {
    if (ptgMap) ptgMap.classList.add('active');
    if (ptgSwap) ptgSwap.classList.remove('active');
    if (!page) showPage('home');
  } else {
    if (ptgSwap) ptgSwap.classList.add('active');
    if (ptgMap) ptgMap.classList.remove('active');
    if (!page) showPage('explore');
  }
  if (page) showPage(page);
}

/* ─── NAV SCROLL ─── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  // progress bar
  const bar = document.getElementById('progressBar');
  if (bar) {
    const scrolled = document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
});

/* ─── HAMBURGER ─── */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }
});

/* ─── THEME TOGGLE ─── */
let darkMode = true;
function toggleTheme() {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = darkMode ? '☀️' : '🌙';
  localStorage.setItem('skillbridge-theme', darkMode ? 'dark' : 'light');
}

/* ─── INIT THEME ─── */
(function() {
  const saved = localStorage.getItem('skillbridge-theme');
  if (saved === 'light') {
    darkMode = false;
    document.documentElement.setAttribute('data-theme', 'light');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = '🌙';
  }
})();

/* ─── PARTICLES ─── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    size: Math.random() * 1.4 + 0.4,
    opacity: Math.random() * 0.3 + 0.05,
    color: ['0,212,200', '14,165,240', '124,92,252'][Math.floor(Math.random() * 3)]
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,200,${0.04 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    // Dots
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
})();

/* ─── MOBILE AUTH UI ─── */
function updateMobileAuthUI() {
  const mobLogin = document.getElementById('mobLoginBtn');
  const mobSignup = document.getElementById('mobSignupBtn');
  const mobProfile = document.getElementById('mobProfileBtn');
  const mobLogout = document.getElementById('mobLogoutBtn');
  if (isLoggedIn) {
    if (mobLogin) mobLogin.style.display = 'none';
    if (mobSignup) mobSignup.style.display = 'none';
    if (mobProfile) mobProfile.style.display = 'block';
    if (mobLogout) mobLogout.style.display = 'block';
  } else {
    if (mobLogin) mobLogin.style.display = 'block';
    if (mobSignup) mobSignup.style.display = 'block';
    if (mobProfile) mobProfile.style.display = 'none';
    if (mobLogout) mobLogout.style.display = 'none';
  }
}

// Hook into updateSwapAuthUI to also update mobile
const _origUpdateSwapAuthUI = window.updateSwapAuthUI;
window.updateSwapAuthUI = function() {
  _origUpdateSwapAuthUI && _origUpdateSwapAuthUI();
  updateMobileAuthUI();
};

/* ─── RIPPLE for all buttons ─── */
document.addEventListener('click', e => {
  const btn = e.target.closest('[class*="btn-"]');
  if (!btn || btn.tagName === 'SELECT') return;
  const existing = btn.querySelector('.ripple');
  if (existing) existing.remove();
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;position:absolute;border-radius:50%;background:rgba(255,255,255,0.2);animation:rippleAnim 0.6s ease-out forwards;pointer-events:none;`;
  btn.style.position = btn.style.position || 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
});
