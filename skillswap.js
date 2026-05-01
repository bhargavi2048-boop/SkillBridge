/* ════════════════════════════════════════
   SKILLPRO — SkillSwap Module JS (UPGRADED v3.0)
   ✅ Explore Swaps → profile creation gate first
   ✅ Login: email only (no Google/GitHub)
   ✅ Share button → generates real working link
   ✅ Profile: displays ALL user details
   ✅ Team page: AI partner instead of "You?"
   ✅ Signup: collects all details incl. bio/skills
════════════════════════════════════════ */
'use strict';

/* ─── GLOBAL STATE ─── */
let isLoggedIn = false;
let currentUser = null;
let currentUserData = null;
const connections = new Set();
const DEFAULT_COLLEGE = 'SRM Institute of Science & Technology';

/* ─── TOAST ─── */
function showToast(msg, type) {
  type = type || 'info';
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:340px;';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = { success: 'rgba(34,211,163,0.15)', error: 'rgba(248,113,113,0.15)', info: 'rgba(14,165,240,0.15)', warning: 'rgba(245,183,49,0.15)' };
  const borders = { success: 'rgba(34,211,163,0.3)', error: 'rgba(248,113,113,0.3)', info: 'rgba(14,165,240,0.3)', warning: 'rgba(245,183,49,0.3)' };
  const toast = document.createElement('div');
  toast.style.cssText = 'background:'+colors[type]+';border:1px solid '+borders[type]+';border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:10px;font-size:0.83rem;color:var(--text);backdrop-filter:blur(12px);animation:toastIn 0.35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 8px 24px rgba(0,0,0,0.4);';
  toast.innerHTML = '<span style="font-size:1.1rem;flex-shrink:0;">'+icons[type]+'</span><span>'+msg+'</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = 'all 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3800);
}

/* ─── MODAL SYSTEM ─── */
function openModal(id) {
  if (isLoggedIn && (id === 'loginModal' || id === 'signupModal')) {
    showToast('You are already logged in 😊', 'info'); return;
  }
  var overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal(id);
  }, { once: true });
}

function closeModal(id) {
  var overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(function(m) {
      m.classList.remove('show'); document.body.style.overflow = '';
    });
  }
});

/* ─── SCROLL REVEAL ─── */
var ssObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); ssObserver.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

function triggerReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(function(el) { ssObserver.observe(el); });
}
function observeReveal() { triggerReveal(); }

/* ─── COUNTERS ─── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(function(el) {
    var target = parseInt(el.dataset.count), suffix = el.dataset.suffix || '', duration = 1800, start = performance.now();
    function update(t) {
      var p = Math.min((t - start) / duration, 1), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

/* ─── ANIMATE BARS ─── */
function animateBars() {
  document.querySelectorAll('.skill-bar-fill[data-width],.activity-bar-fill[data-width]').forEach(function(bar) {
    setTimeout(function() { bar.style.width = bar.dataset.width; }, 200);
  });
}

/* ─── EXPLORE FILTER ─── */
function filterExplore(tag) {
  document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
  event.currentTarget.classList.add('active');
  document.querySelectorAll('.explore-card').forEach(function(card) {
    card.classList.toggle('hidden', tag !== 'all' && !((card.dataset.tags || '').includes(tag)));
  });
}

function searchSkills(query) {
  var q = query.toLowerCase().trim();
  document.querySelectorAll('.explore-card').forEach(function(card) {
    card.classList.toggle('hidden', q.length > 0 && !card.textContent.toLowerCase().includes(q));
  });
}

/* ─── CONNECT ─── */
function connectUser(btn, userName) {
  if (!isLoggedIn) { showToast('Please log in to connect 🔐', 'warning'); openModal('loginModal'); return; }
  if (connections.has(userName)) { showToast('Already connected with ' + userName + '!', 'info'); return; }
  connections.add(userName);
  btn.textContent = '✓ Connected';
  btn.classList.remove('btn-ghost'); btn.classList.add('btn-connected'); btn.disabled = true;
  showToast('Connected with ' + userName + '! 🎉', 'success');
}

/* ─── LOGIN SUCCESS ─── */
function loginSuccess(userData) {
  currentUser = userData.name; currentUserData = userData; isLoggedIn = true;
  closeModal('loginModal'); closeModal('signupModal');
  saveCurrentUserSession();
  updateSwapAuthUI();
  showToast('Welcome, ' + userData.name.split(' ')[0] + '! 🎉', 'success');
  setTimeout(function() { showPage('profile'); }, 600);
}

/* ─── SIGNUP — collects ALL user details ─── */
function handleSignup(e) {
  e.preventDefault();
  var errBox = document.getElementById('signup-error');
  var showErr = function(msg) { if (errBox) { errBox.textContent = msg; errBox.style.display = 'block'; } };
  if (errBox) errBox.style.display = 'none';

  var first = (document.getElementById('signup-firstname') || {}).value || '';
  first = first.trim();
  var last = (document.getElementById('signup-lastname') || {}).value || '';
  last = last.trim();
  var email = (document.getElementById('signup-email') || {}).value || '';
  email = email.trim();
  var pass = (document.getElementById('signup-password') || {}).value || '';
  var confirm = (document.getElementById('signup-confirm') || {}).value || '';
  var univ = (document.getElementById('signup-university') || {}).value || '';
  univ = univ.trim() || DEFAULT_COLLEGE;
  var year = (document.getElementById('signup-year') || {}).value || '1st Year';
  var dept = (document.getElementById('signup-dept') || {}).value || '';
  dept = dept.trim() || 'Computer Science';
  var phone = (document.getElementById('signup-phone') || {}).value || '';
  phone = phone.trim();
  var avatar = (document.getElementById('signup-avatar') || {}).value || '👩‍💻';
  var bio = (document.getElementById('signup-bio') || {}).value || '';
  bio = bio.trim();
  var skillsOffer = (document.getElementById('signup-skills-offer') || {}).value || '';
  skillsOffer = skillsOffer.trim();
  var skillsWant = (document.getElementById('signup-skills-want') || {}).value || '';
  skillsWant = skillsWant.trim();

  if (!first) { showErr('⚠️ First name is required.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('⚠️ Please enter a valid email address.'); return; }
  if (pass.length < 6) { showErr('⚠️ Password must be at least 6 characters.'); return; }
  if (pass !== confirm) { showErr('⚠️ Passwords do not match.'); return; }

  var existing = JSON.parse(localStorage.getItem('skillbridge-users') || '[]');
  if (existing.find(function(u) { return u.email === email; })) {
    if (errBox) {
      errBox.innerHTML = '⚠️ An account with this email already exists. <a href="#" onclick="closeModal(\'signupModal\');openModal(\'loginModal\');var le=document.getElementById(\'login-email\');if(le)le.value=\''+email+'\';return false;" style="color:var(--accent);font-weight:700;text-decoration:underline;">Sign in instead →</a>';
      errBox.style.display = 'block';
    }
    return;
  }

  var userData = {
    name: (first + ' ' + last).trim(), email: email, password: pass,
    university: univ, year: year, department: dept, phone: phone, avatar: avatar, bio: bio,
    provider: 'email',
    skillsOffer: skillsOffer || 'Python, React, Machine Learning',
    skillsWant: skillsWant || 'Guitar, UI Design, Spanish',
    joinedDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    sessions: 0, rating: '4.9', connections: 0, badges: 1
  };
  existing.push(userData);
  localStorage.setItem('skillbridge-users', JSON.stringify(existing));

  currentUserData = Object.assign({}, userData);
  currentUser = currentUserData.name; isLoggedIn = true;
  saveCurrentUserSession();
  closeModal('signupModal'); updateSwapAuthUI();
  showToast('Welcome to SkillBridge, ' + first + '! 🎉', 'success');
  setTimeout(function() { showPage('profile'); }, 600);
}

/* ─── LOGIN — email only, no social logins ─── */
function handleLogin(e) {
  e.preventDefault();
  var errBox = document.getElementById('login-error');
  var showErr = function(msg) { if (errBox) { errBox.textContent = msg; errBox.style.display = 'block'; } };
  if (errBox) errBox.style.display = 'none';

  var email = (document.getElementById('login-email') || {}).value || '';
  email = email.trim();
  var pass = (document.getElementById('login-password') || {}).value || '';

  if (!email) { showErr('⚠️ Please enter your email address.'); return; }
  if (!pass) { showErr('⚠️ Please enter your password.'); return; }

  var users = JSON.parse(localStorage.getItem('skillbridge-users') || '[]');
  var found = users.find(function(u) { return u.email === email; });
  if (!found) { showErr('⚠️ No account found with this email. Please sign up first.'); return; }
  if (found.password !== pass) { showErr('⚠️ Incorrect password. Please try again.'); return; }

  currentUserData = Object.assign({}, found);
  currentUser = currentUserData.name; isLoggedIn = true;
  saveCurrentUserSession();
  closeModal('loginModal'); updateSwapAuthUI();
  showToast('Welcome back, ' + currentUserData.name.split(' ')[0] + '! 👋', 'success');
  setTimeout(function() { showPage('profile'); }, 600);
}

/* ─── LOGOUT ─── */
function handleLogout() {
  isLoggedIn = false; currentUser = null; currentUserData = null; connections.clear();
  localStorage.removeItem('skillbridge-session');
  updateSwapAuthUI();
  showPage('home');
  showToast('Logged out. See you soon! 👋', 'info');
}

/* ─── AUTH UI ─── */
function updateSwapAuthUI() {
  var loginBtn = document.getElementById('navLoginBtn');
  var signupBtn = document.getElementById('navSignupBtn');
  var profileBtn = document.getElementById('navProfileBtn');
  var logoutBtn = document.getElementById('navLogoutBtn');
  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (profileBtn) {
      profileBtn.style.display = 'inline-flex';
      var shortName = (currentUserData && currentUserData.name || currentUser || 'Profile').split(' ')[0];
      profileBtn.textContent = (currentUserData && currentUserData.avatar || '👤') + ' ' + shortName;
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (signupBtn) signupBtn.style.display = 'inline-flex';
    if (profileBtn) profileBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
  updateMobileAuthUI();
}

/* ─── PROFILE PAGE — renders ALL user details ─── */
function renderProfilePage() {
  if (!currentUserData) return;
  var u = currentUserData;

  var avatarEl = document.getElementById('profile-main-avatar');
  if (avatarEl) avatarEl.textContent = u.avatar || '👩‍💻';

  var nameEl = document.getElementById('profile-display-name');
  if (nameEl) nameEl.textContent = u.name || 'Your Name';

  var subEl = document.getElementById('profile-display-uni');
  if (subEl) subEl.textContent = '🎓 ' + (u.university || DEFAULT_COLLEGE) + ' · ' + (u.department || 'Computer Science') + ' · ' + (u.year || '1st Year');

  var emailEl = document.getElementById('profile-display-email');
  if (emailEl) emailEl.textContent = u.email ? '📧 ' + u.email : '';

  var phoneEl = document.getElementById('profile-display-phone');
  if (phoneEl) phoneEl.textContent = u.phone ? '📱 ' + u.phone : '';

  var bioEl = document.getElementById('profile-display-bio');
  if (bioEl) bioEl.textContent = u.bio || '';

  var joinedEl = document.getElementById('profile-joined-date');
  if (joinedEl) joinedEl.textContent = u.joinedDate ? '📅 Joined ' + u.joinedDate : '';

  var sessEl = document.getElementById('profile-stat-sessions');
  if (sessEl) sessEl.textContent = u.sessions || 0;
  var ratingEl = document.getElementById('profile-stat-rating');
  if (ratingEl) ratingEl.textContent = u.rating || '4.9';
  var connEl = document.getElementById('profile-stat-connections');
  if (connEl) connEl.textContent = (u.connections || 0) + connections.size;
  var badgesEl = document.getElementById('profile-stat-badges');
  if (badgesEl) badgesEl.textContent = u.badges || 1;

  refreshProfileSkills();
  updateProfileShareLink();
}

function updateProfileShareLink() {
  if (!currentUserData) return '';
  var u = currentUserData;
  var profileData = {
    n: u.name, u: u.university || DEFAULT_COLLEGE,
    d: u.department || 'Computer Science', y: u.year || '1st Year',
    a: u.avatar || '👩‍💻', o: u.skillsOffer || '',
    w: u.skillsWant || '', b: u.bio || '', j: u.joinedDate || '',
    e: u.email || ''
  };
  var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(profileData))));
  var shareUrl = window.location.href.split('#')[0] + '#profile/' + encoded;
  var urlInput = document.getElementById('profile-share-url');
  if (urlInput) urlInput.value = shareUrl;
  return shareUrl;
}

function refreshProfileSkills() {
  if (!currentUserData) return;
  var offerEl = document.getElementById('profile-skills-offer');
  var wantEl = document.getElementById('profile-skills-want');
  if (offerEl && currentUserData.skillsOffer)
    offerEl.innerHTML = currentUserData.skillsOffer.split(',').map(function(s) {
      s = s.trim(); return s ? '<span class="skill-chip">'+s+'</span>' : '';
    }).join('');
  if (wantEl && currentUserData.skillsWant)
    wantEl.innerHTML = currentUserData.skillsWant.split(',').map(function(s) {
      s = s.trim(); return s ? '<span class="skill-chip want">'+s+'</span>' : '';
    }).join('');
}

/* ─── EDIT PROFILE MODAL ─── */
function openEditProfile() {
  if (!isLoggedIn) { showToast('Please log in to edit your profile', 'warning'); return; }
  var old = document.getElementById('editProfileModal');
  if (old) old.remove();
  var u = currentUserData || {};
  var parts = (u.name || '').split(' '), fname = parts[0] || '', lname = parts.slice(1).join(' ') || '';
  var yearOpts = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'].map(function(y) {
    return '<option value="'+y+'"'+(u.year === y ? ' selected' : '')+'>'+y+'</option>';
  }).join('');
  var avatars = ['👩‍💻','👨‍💻','🎨','🎸','📊','🚀','🌟','💡','🧠','🎯','💎','🔥'];
  var avatarPicker = avatars.map(function(a) {
    return '<span class="avatar-opt'+(u.avatar === a ? ' selected' : '')+'" onclick="selectAvatar(this,\''+a+'\')">'+a+'</span>';
  }).join('');
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show'; modal.id = 'editProfileModal';
  modal.innerHTML = '<div class="modal-box" style="max-width:580px;max-height:90vh;overflow-y:auto;">'
    +'<button class="modal-close" onclick="closeModal(\'editProfileModal\')">✕</button>'
    +'<div class="modal-title">✏️ Edit Profile</div>'
    +'<p style="color:var(--muted2);margin-bottom:20px;font-size:0.82rem;">Your profile is shown to peers who visit your shared link</p>'
    +'<form onsubmit="saveProfile(event)">'
    +'<div class="form-group" style="margin-bottom:14px;"><label style="font-size:0.75rem;color:var(--muted2);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:8px;">Choose Avatar</label>'
    +'<div style="display:flex;flex-wrap:wrap;gap:8px;">'+avatarPicker+'</div>'
    +'<input type="hidden" id="ep-avatar" value="'+(u.avatar||'👩‍💻')+'"></div>'
    +'<div class="form-row"><div class="form-group"><label>First Name *</label><input id="ep-fname" type="text" value="'+fname+'" required placeholder="First name"/></div>'
    +'<div class="form-group"><label>Last Name</label><input id="ep-lname" type="text" value="'+lname+'" placeholder="Last name"/></div></div>'
    +'<div class="form-group"><label>University / College *</label><input id="ep-uni" type="text" value="'+(u.university||DEFAULT_COLLEGE)+'" required /></div>'
    +'<div class="form-row"><div class="form-group"><label>Year of Study</label><select id="ep-year">'+yearOpts+'</select></div>'
    +'<div class="form-group"><label>Department</label><input id="ep-dept" type="text" value="'+(u.department||'')+'" placeholder="Computer Science"/></div></div>'
    +'<div class="form-group"><label>Phone Number</label><input id="ep-phone" type="tel" value="'+(u.phone||'')+'" placeholder="+91 9876543210"/></div>'
    +'<div class="form-group"><label>Skills I Offer <span style="color:var(--muted);font-size:0.72rem;">(comma separated)</span></label>'
    +'<input id="ep-offer" type="text" value="'+(u.skillsOffer||'')+'" placeholder="Python, React, UI Design"/></div>'
    +'<div class="form-group"><label>Skills I Want to Learn</label>'
    +'<input id="ep-want" type="text" value="'+(u.skillsWant||'')+'" placeholder="Guitar, Spanish, Machine Learning"/></div>'
    +'<div class="form-group"><label>Bio <span style="color:var(--muted);font-size:0.72rem;">(optional — shown on your public profile)</span></label>'
    +'<textarea id="ep-bio" rows="3" placeholder="Tell peers about yourself, your goals…">'+(u.bio||'')+'</textarea></div>'
    +'<div style="display:flex;gap:10px;margin-top:16px;">'
    +'<button type="submit" class="btn-primary" style="flex:1;">💾 Save Changes</button>'
    +'<button type="button" class="btn-ghost" onclick="closeModal(\'editProfileModal\')" style="flex:1;">Cancel</button>'
    +'</div></form></div>';
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal('editProfileModal'); });
}

function saveProfile(e) {
  e.preventDefault();
  var avatarEl = document.getElementById('ep-avatar');
  if (avatarEl) currentUserData.avatar = avatarEl.value;
  var fname = document.getElementById('ep-fname').value.trim();
  var lname = document.getElementById('ep-lname').value.trim();
  currentUserData.name = (fname + ' ' + lname).trim();
  currentUserData.university = document.getElementById('ep-uni').value.trim() || DEFAULT_COLLEGE;
  currentUserData.year = document.getElementById('ep-year').value;
  currentUserData.department = document.getElementById('ep-dept').value.trim();
  var phoneEl = document.getElementById('ep-phone');
  if (phoneEl) currentUserData.phone = phoneEl.value.trim();
  currentUserData.skillsOffer = document.getElementById('ep-offer').value.trim();
  currentUserData.skillsWant = document.getElementById('ep-want').value.trim();
  currentUserData.bio = document.getElementById('ep-bio').value.trim();
  currentUser = currentUserData.name;
  saveCurrentUserSession();
  var users = JSON.parse(localStorage.getItem('skillbridge-users') || '[]');
  var idx = users.findIndex(function(u) { return u.email === currentUserData.email; });
  if (idx >= 0) { users[idx] = Object.assign({}, users[idx], currentUserData); localStorage.setItem('skillbridge-users', JSON.stringify(users)); }
  var pb = document.getElementById('navProfileBtn');
  if (pb) pb.textContent = (currentUserData.avatar || '👤') + ' ' + currentUser.split(' ')[0];
  closeModal('editProfileModal');
  renderProfilePage();
  showToast('Profile updated! ✨', 'success');
}

/* ─── SHARE PROFILE — generates real working link ─── */
function shareProfile() {
  if (!isLoggedIn) { showToast('Please log in to share your profile', 'warning'); return; }
  openShareProfile();
}

function openShareProfile() {
  if (!isLoggedIn || !currentUserData) { showToast('Please log in first 🔐', 'warning'); return; }
  var shareUrl = updateProfileShareLink();
  var urlInput = document.getElementById('shareProfileUrl');
  if (urlInput) urlInput.value = shareUrl;
  openModal('shareModal');
}

function copyShareUrl() {
  var url = document.getElementById('shareProfileUrl');
  if (!url) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url.value).then(function() { showToast('Profile link copied! Share it anywhere 🔗', 'success'); });
  } else {
    url.select(); document.execCommand('copy'); showToast('Copied! 🔗', 'success');
  }
}

function shareToWhatsApp() {
  var url = document.getElementById('shareProfileUrl');
  if (!url) return;
  var text = encodeURIComponent('Hey! Check out my SkillBridge profile — see what skills I offer and what I want to learn 🚀 ' + url.value);
  window.open('https://wa.me/?text=' + text, '_blank');
}

function shareToLinkedIn() {
  var url = document.getElementById('shareProfileUrl');
  if (!url) return;
  window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url.value), '_blank');
}

function shareToTwitter() {
  var url = document.getElementById('shareProfileUrl');
  if (!url) return;
  var name = (currentUserData && currentUserData.name && currentUserData.name.split(' ')[0]) || 'my';
  var text = encodeURIComponent('Check out ' + name + '\'s SkillBridge profile! Skills, swaps, and more → ' + url.value + ' #SkillBridge #StudentSkills');
  window.open('https://twitter.com/intent/tweet?text=' + text, '_blank');
}

function copyProfileUrl() {
  var shareUrl = updateProfileShareLink();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(function() { showToast('Profile link copied! 🔗', 'success'); });
  } else {
    showToast('Use the Share Profile button to copy your link 🔗', 'info');
  }
}

/* ─── SHARED PROFILE HASH DETECTION ─── */
function checkSharedProfileHash() {
  var hash = window.location.hash;
  if (!hash.startsWith('#profile/')) return;
  var encoded = hash.replace('#profile/', '');
  try {
    var data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    setTimeout(function() { showSharedProfile(data); }, 500);
  } catch (err) { /* invalid hash */ }
}

function showSharedProfile(data) {
  var offerChips = (data.o || '').split(',').map(function(s) { s = s.trim(); return s ? '<span class="skill-chip">'+s+'</span>' : ''; }).join('');
  var wantChips = (data.w || '').split(',').map(function(s) { s = s.trim(); return s ? '<span class="skill-chip want">'+s+'</span>' : ''; }).join('');
  var modal = document.getElementById('sharedProfileModal');
  var content = document.getElementById('sharedProfileContent');
  if (!modal || !content) return;
  var firstName = (data.n || 'User').split(' ')[0];
  content.innerHTML =
    '<div style="text-align:center;margin-bottom:24px;">'
    +'<div style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,rgba(0,212,200,0.18),rgba(124,92,252,0.12));display:flex;align-items:center;justify-content:center;font-size:3rem;margin:0 auto 16px;border:2px solid rgba(0,212,200,0.25);box-shadow:0 0 32px rgba(0,212,200,0.15);">'+(data.a||'👤')+'</div>'
    +'<div style="font-family:var(--font-head);font-size:1.5rem;font-weight:800;color:var(--text);margin-bottom:4px;">'+(data.n||'SkillBridge User')+'</div>'
    +'<div style="font-size:0.82rem;color:var(--muted2);margin-bottom:6px;">🎓 '+[data.u,data.d,data.y].filter(Boolean).join(' · ')+'</div>'
    +(data.e ? '<div style="font-size:0.75rem;color:var(--muted);margin-bottom:8px;">📧 '+data.e+'</div>' : '')
    +(data.b ? '<p style="font-size:0.85rem;color:var(--muted2);margin-top:10px;font-style:italic;max-width:380px;margin-left:auto;margin-right:auto;line-height:1.7;">"'+data.b+'"</p>' : '')
    +'<div style="display:flex;gap:8px;justify-content:center;margin-top:14px;flex-wrap:wrap;">'
    +'<span style="background:rgba(0,212,200,0.1);border:1px solid rgba(0,212,200,0.2);border-radius:100px;padding:3px 12px;font-size:0.72rem;color:var(--accent);">✓ Verified Student</span>'
    +(data.j ? '<span style="background:rgba(124,92,252,0.08);border:1px solid rgba(124,92,252,0.2);border-radius:100px;padding:3px 12px;font-size:0.72rem;color:var(--accent3);">📅 Joined '+data.j+'</span>' : '')
    +'</div></div>'
    +(offerChips ? '<div style="background:var(--bg2);border-radius:12px;padding:16px;margin-bottom:12px;"><p style="font-size:0.72rem;color:var(--muted2);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">🎓 Skills Offered</p><div class="skills-list" style="gap:8px;">'+offerChips+'</div></div>' : '')
    +(wantChips ? '<div style="background:var(--bg2);border-radius:12px;padding:16px;margin-bottom:20px;"><p style="font-size:0.72rem;color:var(--muted2);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">🎯 Skills Wanted</p><div class="skills-list" style="gap:8px;">'+wantChips+'</div></div>' : '')
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;">'
    +'<button class="btn-primary" style="flex:1;" onclick="handleSharedConnect(\''+firstName+'\')">🤝 Connect with '+firstName+'</button>'
    +'<button class="btn-ghost" style="flex:1;" onclick="closeModal(\'sharedProfileModal\');if(!isLoggedIn){openModal(\'signupModal\');}else{showPage(\'explore\');}">⇄ Explore Swaps</button>'
    +'</div>';
  openModal('sharedProfileModal');
}

function handleSharedConnect(firstName) {
  closeModal('sharedProfileModal');
  if (!isLoggedIn) {
    showToast('Create a free account to connect with ' + firstName + '! 🚀', 'info');
    openModal('signupModal');
  } else {
    showToast('Connection request sent to ' + firstName + '! 🎉', 'success');
  }
}

/* ─── HERO BUTTONS ─── */
function handleHeroAnalyze() {
  if (!isLoggedIn) { showExploreGate('analyze'); } else { showPage('demo'); }
}

function handleHeroExploreSwaps() {
  if (!isLoggedIn) { showExploreGate('swaps'); } else { showPage('explore'); }
}

/* ─── EXPLORE GATE ─── */
function showExploreGate(mode) {
  var old = document.getElementById('exploreGate');
  if (old) old.remove();
  var isSwap = mode === 'swaps';
  var icon = isSwap ? '⇄' : '🔍';
  var title = isSwap ? 'Create Your Profile to Explore Swaps' : 'Create Your Profile to Analyze Skills';
  var desc = isSwap
    ? 'Browse 340+ skills and connect with 12,000+ students across India. Create your free SkillBridge profile — takes less than 60 seconds!'
    : 'Get a personalized AI skill gap analysis and 30-day roadmap. Create your free profile to get started.';
  var gate = document.createElement('div');
  gate.id = 'exploreGate';
  gate.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem;';
  gate.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border2);border-radius:24px;padding:44px 40px;max-width:480px;width:100%;text-align:center;position:relative;box-shadow:0 40px 80px rgba(0,0,0,0.6);">'
    +'<button style="position:absolute;top:16px;right:16px;background:none;border:none;color:var(--muted2);cursor:pointer;font-size:1.3rem;line-height:1;padding:4px 8px;border-radius:6px;" onclick="document.getElementById(\'exploreGate\').remove()">✕</button>'
    +'<div style="width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,rgba(0,212,200,0.15),rgba(124,92,252,0.1));border:1px solid rgba(0,212,200,0.25);display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 20px;">'+icon+'</div>'
    +'<h2 style="font-family:var(--font-head);font-size:1.4rem;font-weight:800;margin-bottom:12px;color:var(--text);">'+title+'</h2>'
    +'<p style="color:var(--muted2);font-size:0.88rem;line-height:1.7;margin-bottom:28px;">'+desc+'</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px;">'
    +'<button class="btn-primary" style="width:100%;padding:14px;font-size:0.95rem;" onclick="document.getElementById(\'exploreGate\').remove();openModal(\'signupModal\');">🚀 Create Free Profile</button>'
    +'<button class="btn-ghost" style="width:100%;" onclick="document.getElementById(\'exploreGate\').remove();openModal(\'loginModal\');">🔐 Already have an account? Sign In</button>'
    +'</div>'
    +'<p style="font-size:0.72rem;color:var(--muted);margin-top:16px;">No credit card required · Free forever</p>'
    +'</div>';
  document.body.appendChild(gate);
}

/* ─── QUICK PROFILE MODAL ─── */
function openProfileModal(name, school, emoji, skills, learning, matchPct) {
  var old = document.getElementById('quickProfileModal'); if (old) old.remove();
  var sArr = Array.isArray(skills) ? skills : [];
  var lArr = Array.isArray(learning) ? learning : [];
  var sHTML = sArr.map(function(s) { return '<span class="skill-chip">'+s+'</span>'; }).join('');
  var lHTML = lArr.map(function(s) { return '<span class="skill-chip want">'+s+'</span>'; }).join('');
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show'; modal.id = 'quickProfileModal';
  modal.innerHTML = '<div class="modal-box" style="max-width:480px;">'
    +'<button class="modal-close" onclick="closeModal(\'quickProfileModal\')">✕</button>'
    +'<div style="text-align:center;margin-bottom:24px;">'
    +'<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,rgba(0,212,200,0.15),rgba(124,92,252,0.1));display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 12px;border:2px solid rgba(0,212,200,0.2);">'+emoji+'</div>'
    +'<div class="modal-title" style="margin-bottom:4px;">'+name+'</div>'
    +'<p style="font-size:0.82rem;color:var(--muted2);">'+school+'</p>'
    +'<div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap;">'
    +'<span style="background:rgba(34,211,163,0.1);border:1px solid rgba(34,211,163,0.2);border-radius:100px;padding:3px 12px;font-size:0.72rem;color:var(--green);">⭐ 4.8 Rating</span>'
    +'<span style="background:rgba(0,212,200,0.1);border:1px solid rgba(0,212,200,0.2);border-radius:100px;padding:3px 12px;font-size:0.72rem;color:var(--accent);">'+matchPct+' Match</span>'
    +'</div></div>'
    +'<div style="background:var(--bg2);border-radius:12px;padding:16px;margin-bottom:12px;"><p style="font-size:0.72rem;color:var(--muted2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">🎓 Teaching</p><div class="skills-list">'+(sHTML||'<span class="skill-chip">Python</span>')+'</div></div>'
    +'<div style="background:var(--bg2);border-radius:12px;padding:16px;margin-bottom:20px;"><p style="font-size:0.72rem;color:var(--muted2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">🎯 Learning</p><div class="skills-list">'+(lHTML||'<span class="skill-chip want">UI Design</span>')+'</div></div>'
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;">'
    +'<button class="btn-primary" style="flex:1;" onclick="if(!isLoggedIn){closeModal(\'quickProfileModal\');showToast(\'Create an account to book sessions!\',\'info\');openModal(\'signupModal\');}else{closeModal(\'quickProfileModal\');openScheduleModal(\''+name+'\');}">📅 Book Session</button>'
    +'<button class="btn-ghost" style="flex:1;" onclick="closeModal(\'quickProfileModal\');showToast(\'Message sent to '+name+'!\',\'success\')">💬 Message</button>'
    +'</div></div>';
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal('quickProfileModal'); });
}

/* ─── SCHEDULE MODAL ─── */
function openScheduleModal(name) {
  var old = document.getElementById('scheduleModal'); if (old) old.remove();
  var times = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show'; modal.id = 'scheduleModal';
  modal.innerHTML = '<div class="modal-box" style="max-width:440px;">'
    +'<button class="modal-close" onclick="closeModal(\'scheduleModal\')">✕</button>'
    +'<div class="modal-title">📅 Book Session'+(name ? ' with '+name : '')+'</div>'
    +'<form onsubmit="handleSchedule(event)" style="margin-top:1.25rem;">'
    +'<div class="form-group"><label>Preferred Date</label><input type="date" required min="'+new Date().toISOString().split('T')[0]+'"/></div>'
    +'<div class="form-group"><label>Preferred Time</label><select required>'+times.map(function(t) { return '<option>'+t+'</option>'; }).join('')+'</select></div>'
    +'<div class="form-group"><label>Session Type</label><select><option>Video Call</option><option>Audio Call</option><option>Chat Only</option></select></div>'
    +'<div class="form-group"><label>Topic / Goal</label><textarea rows="3" placeholder="What do you want to learn or teach in this session?"></textarea></div>'
    +'<button type="submit" class="btn-primary" style="width:100%;margin-top:8px;">✓ Confirm Booking</button>'
    +'</form></div>';
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal('scheduleModal'); });
}

function handleSchedule(e) {
  e.preventDefault();
  closeModal('scheduleModal');
  showToast('Session booked! 📅 Calendar invite sent.', 'success');
  // ── Streak & Gamification hook ──
  if (typeof onSessionBooked === 'function') onSessionBooked();
}

/* ─── CONTACT FORM ─── */
function submitContactForm() {
  var firstName = document.getElementById('firstName');
  var contactEmail = document.getElementById('contactEmail');
  var contactMessage = document.getElementById('contactMessage');
  if (!firstName || !firstName.value.trim()) { showToast('Please enter your first name', 'warning'); return; }
  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value)) { showToast('Please enter a valid email address', 'warning'); return; }
  if (!contactMessage || !contactMessage.value.trim()) { showToast('Please enter a message', 'warning'); return; }
  var btn = document.getElementById('contactSubmitBtn');
  if (btn) { btn.textContent = '✅ Message Sent!'; btn.disabled = true; setTimeout(function() { btn.textContent = 'Send Message 🚀'; btn.disabled = false; }, 3000); }
  ['firstName','lastName','contactEmail','contactPhone','reason','contactMessage'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  showToast("Message sent! We'll reply within 24 hours 📧", 'success');
}

/* ─── AVATAR PICKER ─── */
function selectAvatar(el, emoji) {
  document.querySelectorAll('.avatar-opt').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  var signupInp = document.getElementById('signup-avatar');
  if (signupInp) signupInp.value = emoji;
  var epInp = document.getElementById('ep-avatar');
  if (epInp) epInp.value = emoji;
}

/* ─── SESSION PERSISTENCE ─── */
function saveCurrentUserSession() {
  if (currentUserData) localStorage.setItem('skillbridge-session', JSON.stringify(currentUserData));
}

function restoreSession() {
  var saved = localStorage.getItem('skillbridge-session');
  if (saved) {
    try {
      var sessionData = JSON.parse(saved);
      // Re-sync from users array so we always have the latest saved profile
      var users = JSON.parse(localStorage.getItem('skillbridge-users') || '[]');
      var fresh = users.find(function(u) { return u.email === sessionData.email; });
      currentUserData = fresh ? Object.assign({}, fresh) : sessionData;
      currentUser = currentUserData.name;
      isLoggedIn = true;
      updateSwapAuthUI();
    } catch (e) { localStorage.removeItem('skillbridge-session'); }
  }
}

/* ─── MOBILE AUTH UI ─── */
function updateMobileAuthUI() {
  var mobLogin = document.getElementById('mobLoginBtn');
  var mobSignup = document.getElementById('mobSignupBtn');
  var mobProfile = document.getElementById('mobProfileBtn');
  var mobLogout = document.getElementById('mobLogoutBtn');
  if (isLoggedIn) {
    if (mobLogin) mobLogin.style.display = 'none';
    if (mobSignup) mobSignup.style.display = 'none';
    if (mobProfile) { mobProfile.style.display = 'block'; mobProfile.textContent = (currentUserData && currentUserData.avatar || '👤') + ' My Profile'; }
    if (mobLogout) mobLogout.style.display = 'block';
  } else {
    if (mobLogin) mobLogin.style.display = 'block';
    if (mobSignup) mobSignup.style.display = 'block';
    if (mobProfile) mobProfile.style.display = 'none';
    if (mobLogout) mobLogout.style.display = 'none';
  }
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', function() {
  restoreSession();
  checkSharedProfileHash();
});

window.addEventListener('hashchange', checkSharedProfileHash);
