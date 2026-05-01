/* ═══════════════════════════════════════════════════════
   SkillBridge — User Profile Pages & Book Session
   Enhanced by AI Expert | v2.0
   ═══════════════════════════════════════════════════════ */

/* ── Extended profile data for each explore person ── */
const EXPLORE_PROFILES = {
  'Priya Sharma': {
    emoji: '👩‍💻',
    name: 'Priya Sharma',
    school: 'IIT Madras · CSE',
    year: '3rd Year B.Tech',
    location: 'Chennai, Tamil Nadu',
    rating: 4.9,
    sessions: 34,
    connections: 28,
    match: 94,
    tags: 'tech',
    bio: 'Passionate ML engineer and Python enthusiast. I love breaking down complex concepts into simple, practical lessons. Have taught 30+ students machine learning fundamentals and helped 12 secure internships at top companies.',
    offers: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Pandas'],
    wants: ['Guitar', 'Spanish', 'UI Design', 'Photography'],
    badges: ['🥇 Top Teacher', '⭐ 4.9 Star', '🔥 50-day Streak', '🤝 Verified'],
    reviews: [
      { name: 'Arjun N.', emoji: '👨‍💻', rating: 5, text: 'Priya explained ML concepts so clearly! Landed my ML internship after 3 sessions with her.' },
      { name: 'Meera R.', emoji: '👩‍🎨', rating: 5, text: 'Amazing teacher! Patient, thorough, and really knows her stuff.' },
      { name: 'Rohit V.', emoji: '📊', rating: 5, text: 'Best Python sessions I have ever had. Highly recommend!' }
    ],
    availability: ['Mon 6-8 PM', 'Wed 5-7 PM', 'Sat 10 AM-1 PM'],
    level: 'Advanced',
    language: 'English, Tamil, Hindi'
  },
  'Arjun Nair': {
    emoji: '👨‍💻',
    name: 'Arjun Nair',
    school: 'NIT Trichy · IT',
    year: '4th Year B.Tech',
    location: 'Trichy, Tamil Nadu',
    rating: 4.7,
    sessions: 22,
    connections: 19,
    match: 87,
    tags: 'tech',
    bio: 'Full-stack developer with a love for clean code and modern UI. Currently building a SaaS product in my spare time. Happy to share everything I know about React, TypeScript, and Node.js ecosystems.',
    offers: ['React', 'TypeScript', 'Node.js', 'Next.js', 'REST APIs'],
    wants: ['Violin', 'Photography', 'Figma', 'Sketch'],
    badges: ['🚀 Full-Stack Pro', '⭐ 4.7 Star', '🤝 Verified'],
    reviews: [
      { name: 'Priya S.', emoji: '👩‍💻', rating: 5, text: 'Arjun taught me React hooks in the most intuitive way. Awesome!' },
      { name: 'Karan S.', emoji: '🤖', rating: 4, text: 'Really solid TypeScript knowledge. Helped me fix a nasty type error.' }
    ],
    availability: ['Tue 7-9 PM', 'Thu 6-8 PM', 'Sun 11 AM-2 PM'],
    level: 'Advanced',
    language: 'English, Malayalam, Tamil'
  },
  'Meera Reddy': {
    emoji: '👩‍🎨',
    name: 'Meera Reddy',
    school: 'BITS Pilani · Design',
    year: '3rd Year B.Des',
    location: 'Pilani, Rajasthan',
    rating: 4.8,
    sessions: 29,
    connections: 24,
    match: 82,
    tags: 'design',
    bio: 'UI/UX designer turned design educator. I believe everyone can design beautifully with the right guidance. My teaching style focuses on design thinking and systems, not just tools.',
    offers: ['Figma', 'Illustrator', 'Adobe XD', 'UI Design', 'Design Systems'],
    wants: ['Python', 'Data Analysis', 'SQL', 'No-Code Tools'],
    badges: ['🎨 Design Guru', '⭐ 4.8 Star', '🤝 Verified', '🌟 Rising Star'],
    reviews: [
      { name: 'Aisha K.', emoji: '💼', rating: 5, text: 'Meera taught me Figma from scratch. Now I design all my presentations with it!' },
      { name: 'Dev P.', emoji: '📐', rating: 5, text: 'She gave me a whole new perspective on design thinking. Incredible sessions.' }
    ],
    availability: ['Mon 4-6 PM', 'Wed 7-9 PM', 'Sat 2-5 PM'],
    level: 'Intermediate',
    language: 'English, Telugu, Hindi'
  },
  'Rahul Gupta': {
    emoji: '🎸',
    name: 'Rahul Gupta',
    school: 'VIT Chennai · CSE',
    year: '2nd Year B.Tech',
    location: 'Chennai, Tamil Nadu',
    rating: 4.6,
    sessions: 18,
    connections: 15,
    match: 78,
    tags: 'music',
    bio: 'Self-taught guitarist with 7 years of experience. I teach from absolute basics to advanced fingerpicking and music theory. Music changed my life — I want it to change yours too.',
    offers: ['Guitar', 'Music Theory', 'Piano', 'Chords', 'Fingerpicking'],
    wants: ['React', 'Web Dev', 'JavaScript', 'Flutter'],
    badges: ['🎵 Music Maestro', '⭐ 4.6 Star', '🤝 Verified'],
    reviews: [
      { name: 'Sneha I.', emoji: '🌐', rating: 5, text: 'Rahul is incredibly patient with beginners. I could play a song within 3 sessions!' },
      { name: 'Pooja M.', emoji: '🎨', rating: 4, text: 'Great music theory lessons. He explains concepts with real examples.' }
    ],
    availability: ['Tue 5-7 PM', 'Fri 6-8 PM', 'Sun 10 AM-12 PM'],
    level: 'All Levels',
    language: 'English, Hindi'
  },
  'Aisha Khan': {
    emoji: '💼',
    name: 'Aisha Khan',
    school: 'SRM Institute · MBA',
    year: '1st Year MBA',
    location: 'Chennai, Tamil Nadu',
    rating: 4.9,
    sessions: 41,
    connections: 36,
    match: 91,
    tags: 'business',
    bio: 'Business analyst with internship experience at two Big 4 firms. I teach Excel, PowerPoint, and analytical thinking that actually get you hired. My students have cracked roles at Deloitte, PwC, and McKinsey.',
    offers: ['Excel', 'Business Analysis', 'PowerPoint', 'SQL Basics', 'Case Studies'],
    wants: ['Python', 'Data Science', 'Tableau', 'R Language'],
    badges: ['💼 Business Pro', '⭐ 4.9 Star', '🥇 Most Booked', '🤝 Verified'],
    reviews: [
      { name: 'Vikram B.', emoji: '🎵', rating: 5, text: 'Aisha helped me crack my consulting case interview. Phenomenal!' },
      { name: 'Lakshmi P.', emoji: '🏗️', rating: 5, text: 'Her Excel skills are unreal. I went from basic to advanced in 5 sessions.' }
    ],
    availability: ['Mon 8-10 PM', 'Thu 7-9 PM', 'Sat 9-11 AM'],
    level: 'Beginner to Advanced',
    language: 'English, Urdu, Hindi'
  },
  'Dev Patel': {
    emoji: '📐',
    name: 'Dev Patel',
    school: 'SASTRA University · Maths',
    year: '3rd Year B.Sc',
    location: 'Thanjavur, Tamil Nadu',
    rating: 4.5,
    sessions: 15,
    connections: 12,
    match: 73,
    tags: 'math',
    bio: 'Mathematics enthusiast who believes every concept has a beautiful geometric intuition behind it. I make calculus, statistics, and linear algebra feel natural and fun, not scary.',
    offers: ['Calculus', 'Statistics', 'Linear Algebra', 'Probability', 'Discrete Math'],
    wants: ['Guitar', 'Art', 'Design', 'Creative Writing'],
    badges: ['📐 Math Wizard', '⭐ 4.5 Star', '🤝 Verified'],
    reviews: [
      { name: 'Rohit V.', emoji: '📊', rating: 5, text: 'Dev made probability click for me after years of confusion. Genius!' },
      { name: 'Arjun N.', emoji: '👨‍💻', rating: 4, text: 'Great linear algebra sessions. Very patient and explains slowly.' }
    ],
    availability: ['Wed 6-8 PM', 'Fri 5-7 PM', 'Sun 3-6 PM'],
    level: 'Beginner to Intermediate',
    language: 'English, Gujarati, Hindi'
  },
  'Sneha Iyer': {
    emoji: '🌐',
    name: 'Sneha Iyer',
    school: 'Amrita College · CS',
    year: '4th Year B.Tech',
    location: 'Coimbatore, Tamil Nadu',
    rating: 4.8,
    sessions: 27,
    connections: 22,
    match: 86,
    tags: 'language',
    bio: 'Trilingual language coach passionate about connecting cultures through conversation. I use immersive techniques proven to accelerate language acquisition. Currently learning Japanese!',
    offers: ['French', 'Spanish', 'German', 'English Grammar', 'IELTS Prep'],
    wants: ['Python', 'ML', 'Data Science', 'NLP'],
    badges: ['🌐 Language Pro', '⭐ 4.8 Star', '🤝 Verified', '🌍 Polyglot'],
    reviews: [
      { name: 'Meera R.', emoji: '👩‍🎨', rating: 5, text: 'Sneha got me conversational in Spanish in just 2 months. Incredible!' },
      { name: 'Karan S.', emoji: '🤖', rating: 5, text: 'Her French classes are interactive and actually fun. Never boring!' }
    ],
    availability: ['Mon 5-7 PM', 'Tue 6-8 PM', 'Sat 8-11 AM'],
    level: 'All Levels',
    language: 'English, Tamil, French, Spanish, German'
  },
  'Karan Singh': {
    emoji: '🤖',
    name: 'Karan Singh',
    school: 'Manipal University · ECE',
    year: '3rd Year B.Tech',
    location: 'Manipal, Karnataka',
    rating: 4.7,
    sessions: 20,
    connections: 17,
    match: 80,
    tags: 'tech',
    bio: 'Hardware hacker and IoT builder. I have shipped 5 real-world IoT products and love teaching hands-on electronics. From blinking an LED to building a smart home — I cover it all.',
    offers: ['Arduino', 'Raspberry Pi', 'IoT', 'Embedded C', 'Circuit Design'],
    wants: ['UI Design', 'Figma', 'Branding', 'Mobile Apps'],
    badges: ['🤖 IoT Expert', '⭐ 4.7 Star', '🤝 Verified'],
    reviews: [
      { name: 'Dev P.', emoji: '📐', rating: 5, text: 'Karan helped me build my first Arduino project. Super practical teaching!' },
      { name: 'Priya S.', emoji: '👩‍💻', rating: 4, text: 'Great at connecting hardware concepts to software. Unique perspective!' }
    ],
    availability: ['Thu 5-7 PM', 'Sat 11 AM-2 PM', 'Sun 4-7 PM'],
    level: 'Beginner to Advanced',
    language: 'English, Hindi, Punjabi'
  },
  'Lakshmi Prasad': {
    emoji: '🏗️',
    name: 'Lakshmi Prasad',
    school: 'NIT Warangal · Civil',
    year: '4th Year B.Tech',
    location: 'Warangal, Telangana',
    rating: 4.6,
    sessions: 16,
    connections: 13,
    match: 75,
    tags: 'math',
    bio: 'Civil engineering student with deep expertise in CAD tools and structural analysis software. Teaching AutoCAD and STAAD.Pro to students nationwide. Building the infrastructure of tomorrow, teaching it today.',
    offers: ['AutoCAD', 'STAAD.Pro', 'Surveying', 'Structural Analysis', 'Civil Drawing'],
    wants: ['MS Excel', 'PowerPoint', 'Business Writing', 'Presentation Skills'],
    badges: ['🏗️ CAD Expert', '⭐ 4.6 Star', '🤝 Verified'],
    reviews: [
      { name: 'Aisha K.', emoji: '💼', rating: 5, text: 'Lakshmi taught me AutoCAD basics for my architecture elective. Brilliant!' },
      { name: 'Vikram B.', emoji: '🎵', rating: 4, text: 'Very thorough in structural concepts. Great for civil students.' }
    ],
    availability: ['Mon 7-9 PM', 'Wed 4-6 PM', 'Sun 2-5 PM'],
    level: 'Beginner to Intermediate',
    language: 'English, Telugu, Hindi'
  },
  'Rohit Verma': {
    emoji: '📊',
    name: 'Rohit Verma',
    school: 'IIIT Hyderabad · CS',
    year: '4th Year B.Tech',
    location: 'Hyderabad, Telangana',
    rating: 4.9,
    sessions: 38,
    connections: 31,
    match: 92,
    tags: 'tech',
    bio: 'Data storyteller passionate about turning raw numbers into actionable insights. Power BI certified, Tableau expert. My students have built dashboards used by real companies.',
    offers: ['SQL', 'Tableau', 'Power BI', 'Excel Advanced', 'Data Visualization'],
    wants: ['Guitar', 'Music Production', 'Drums', 'Piano'],
    badges: ['📊 Data Wizard', '⭐ 4.9 Star', '🥇 Top Rated', '🤝 Verified'],
    reviews: [
      { name: 'Priya S.', emoji: '👩‍💻', rating: 5, text: 'Rohit built an entire dashboard with me from scratch. Mind-blowing session!' },
      { name: 'Aisha K.', emoji: '💼', rating: 5, text: 'Best SQL teacher on the platform. Queries finally make sense to me.' }
    ],
    availability: ['Tue 6-9 PM', 'Fri 7-9 PM', 'Sat 3-6 PM'],
    level: 'Beginner to Advanced',
    language: 'English, Hindi'
  },
  'Pooja Menon': {
    emoji: '🎨',
    name: 'Pooja Menon',
    school: 'Amrita · Fine Arts',
    year: '3rd Year B.F.A',
    location: 'Coimbatore, Tamil Nadu',
    rating: 4.7,
    sessions: 21,
    connections: 18,
    match: 77,
    tags: 'design',
    bio: 'Fine arts student who bridges traditional and digital art. I teach painting, sketching, and composition with a focus on developing a personal artistic voice. Art is for everyone!',
    offers: ['Oil Painting', 'Watercolor', 'Sketching', 'Color Theory', 'Composition'],
    wants: ['Python', 'AI Art', 'Photoshop', 'Digital Illustration'],
    badges: ['🎨 Art Star', '⭐ 4.7 Star', '🤝 Verified'],
    reviews: [
      { name: 'Rahul G.', emoji: '🎸', rating: 5, text: 'Pooja helped me draw for the first time in my life. So patient!' },
      { name: 'Dev P.', emoji: '📐', rating: 5, text: 'Her color theory class was phenomenal. Changed how I see the world.' }
    ],
    availability: ['Mon 3-5 PM', 'Thu 4-6 PM', 'Sat 10 AM-1 PM'],
    level: 'All Levels',
    language: 'English, Malayalam, Tamil'
  },
  'Vikram Bhat': {
    emoji: '🎵',
    name: 'Vikram Bhat',
    school: 'RV College · CS',
    year: '2nd Year B.Tech',
    location: 'Bangalore, Karnataka',
    rating: 4.5,
    sessions: 14,
    connections: 11,
    match: 69,
    tags: 'music',
    bio: 'Classical musician with training in Carnatic violin, tabla, and vocal music. I teach both Western and Indian classical forms and believe music transcends language and culture.',
    offers: ['Carnatic Violin', 'Tabla', 'Classical Music', 'Rhythm Theory', 'Ragas'],
    wants: ['React', 'Full Stack', 'APIs', 'App Development'],
    badges: ['🎵 Classical Pro', '⭐ 4.5 Star', '🤝 Verified'],
    reviews: [
      { name: 'Sneha I.', emoji: '🌐', rating: 5, text: 'Vikram taught me the basics of Carnatic music. Beautiful experience!' },
      { name: 'Rahul G.', emoji: '🎸', rating: 4, text: 'Great rhythm theory sessions. Really deepened my music understanding.' }
    ],
    availability: ['Wed 5-7 PM', 'Fri 4-6 PM', 'Sun 9-11 AM'],
    level: 'Beginner to Intermediate',
    language: 'English, Kannada, Hindi'
  }
};

/* ── Show individual user profile page ── */
function showUserProfile(personName) {
  const data = EXPLORE_PROFILES[personName];
  if (!data) { showToast('Profile not found', 'error'); return; }

  // Remove existing dynamic profile page if present
  const existingPage = document.getElementById('page-user-profile');
  if (existingPage) existingPage.remove();

  const starsHTML = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let s = '';
    for (let i = 0; i < 5; i++) {
      if (i < full) s += '<span style="color:#f5b731">★</span>';
      else if (i === full && half) s += '<span style="color:#f5b731">☆</span>';
      else s += '<span style="color:var(--border)">★</span>';
    }
    return s;
  };

  const offersHTML = data.offers.map(s => `<span class="skill-chip">${s}</span>`).join('');
  const wantsHTML = data.wants.map(s => `<span class="skill-chip want">${s}</span>`).join('');
  const badgesHTML = data.badges.map(b => `<span class="up-badge">${b}</span>`).join('');
  const availHTML = data.availability.map(a => `<span class="up-avail-chip">${a}</span>`).join('');
  const reviewsHTML = data.reviews.map(r => `
    <div class="up-review-card">
      <div class="up-review-header">
        <span class="up-review-avatar">${r.emoji}</span>
        <div>
          <div class="up-review-name">${r.name}</div>
          <div class="up-review-stars">${starsHTML(r.rating)}</div>
        </div>
      </div>
      <p class="up-review-text">"${r.text}"</p>
    </div>
  `).join('');

  const bookAction = `if(!isLoggedIn){showToast('Please log in to book sessions 🔐','warning');openModal('loginModal');}else{openScheduleModal('${data.name}');}`;

  const pageHTML = `
  <div class="page" id="page-user-profile">
    <div class="up-section">

      <!-- Back Button -->
      <button class="up-back-btn" onclick="showPage('explore')">
        ← Back to Explore
      </button>

      <!-- Profile Hero -->
      <div class="up-hero-card">
        <div class="up-hero-left">
          <div class="up-avatar-wrap">
            <div class="up-avatar">${data.emoji}</div>
            <div class="up-online-dot"></div>
          </div>
          <div class="up-hero-info">
            <h1 class="up-name">${data.name}</h1>
            <p class="up-school">${data.school}</p>
            <p class="up-meta">${data.year} · ${data.location}</p>
            <div class="up-rating-row">
              <span class="up-stars">${starsHTML(data.rating)}</span>
              <span class="up-rating-num">${data.rating}</span>
              <span class="up-rating-count">(${data.reviews.length + 8} reviews)</span>
            </div>
            <div class="up-match-badge">${data.match}% Match with You</div>
          </div>
        </div>
        <div class="up-hero-right">
          <div class="up-hero-stats">
            <div class="up-stat-pill">
              <div class="up-stat-val">${data.sessions}</div>
              <div class="up-stat-label">Sessions</div>
            </div>
            <div class="up-stat-pill">
              <div class="up-stat-val">${data.connections}</div>
              <div class="up-stat-label">Connections</div>
            </div>
            <div class="up-stat-pill">
              <div class="up-stat-val">${data.rating}⭐</div>
              <div class="up-stat-label">Rating</div>
            </div>
          </div>
          <div class="up-cta-group">
            <button class="btn-primary up-book-btn" onclick="${bookAction}">
              📅 Book a Session
            </button>
            <button class="btn-ghost up-msg-btn" onclick="showToast('Message sent to ${data.name}! 💬','success')">
              💬 Message
            </button>
            <button class="btn-ghost up-connect-btn" onclick="connectUser(this,'${data.name}')">
              🤝 Connect
            </button>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="up-content-grid">

        <!-- Left Column -->
        <div class="up-left-col">

          <!-- About -->
          <div class="up-card">
            <div class="up-card-title">📖 About</div>
            <p class="up-bio">${data.bio}</p>
            <div class="up-meta-list">
              <div class="up-meta-item"><span>🌍</span><span>${data.language}</span></div>
              <div class="up-meta-item"><span>📚</span><span>${data.level}</span></div>
              <div class="up-meta-item"><span>📍</span><span>${data.location}</span></div>
            </div>
          </div>

          <!-- Badges -->
          <div class="up-card">
            <div class="up-card-title">🏆 Achievements</div>
            <div class="up-badges-wrap">${badgesHTML}</div>
          </div>

          <!-- Skills Teaching -->
          <div class="up-card">
            <div class="up-card-title">🎓 Skills I Can Teach</div>
            <div class="skills-list">${offersHTML}</div>
          </div>

          <!-- Skills Wanting -->
          <div class="up-card">
            <div class="up-card-title">🎯 Skills I Want to Learn</div>
            <div class="skills-list">${wantsHTML}</div>
          </div>

        </div>

        <!-- Right Column -->
        <div class="up-right-col">

          <!-- Book Session CTA Card -->
          <div class="up-book-card">
            <div class="up-book-card-avatar">${data.emoji}</div>
            <div class="up-book-card-title">Ready to learn with ${data.name.split(' ')[0]}?</div>
            <p class="up-book-card-sub">Book a 1-on-1 session and start your learning journey today.</p>
            <button class="btn-primary" style="width:100%;font-size:1rem;padding:14px;border-radius:14px;margin-bottom:10px;" onclick="${bookAction}">
              📅 Book a Session
            </button>
            <button class="btn-ghost" style="width:100%;font-size:0.9rem;padding:12px;border-radius:14px;" onclick="showToast('Message sent to ${data.name}! 💬','success')">
              💬 Send a Message
            </button>
          </div>

          <!-- Availability -->
          <div class="up-card">
            <div class="up-card-title">🕐 Availability</div>
            <div class="up-avail-wrap">${availHTML}</div>
          </div>

          <!-- Reviews -->
          <div class="up-card">
            <div class="up-card-title">⭐ Student Reviews</div>
            <div class="up-reviews-list">${reviewsHTML}</div>
            <button class="btn-ghost" style="width:100%;margin-top:12px;font-size:0.82rem;" onclick="showToast('Loading more reviews…','info')">View All Reviews</button>
          </div>

        </div>
      </div>

      <!-- Floating Book Session Button (mobile) -->
      <div class="up-mobile-cta">
        <button class="btn-primary" style="width:100%;font-size:1rem;padding:14px;border-radius:14px;" onclick="${bookAction}">
          📅 Book a Session with ${data.name.split(' ')[0]}
        </button>
      </div>

    </div>
  </div>`;

  // Inject into DOM
  const mainContent = document.getElementById('mainContent') || document.querySelector('main') || document.body;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = pageHTML;
  const newPage = tempDiv.firstElementChild;
  document.body.appendChild(newPage);

  // Show the new page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  newPage.classList.add('active');
  window.scrollTo(0, 0);
  if (typeof observeReveal === 'function') observeReveal();
}

/* ── Override renderExploreCards to use showUserProfile ── */
function renderExploreCardsEnhanced() {
  const grid = document.querySelector('.explore-grid');
  if (!grid) return;

  const EXPLORE_PEOPLE_ENH = Object.values(EXPLORE_PROFILES);

  grid.innerHTML = EXPLORE_PEOPLE_ENH.map(p => `
    <div class="explore-card reveal" data-tags="${p.tags}">
      <div class="exp-card-top">
        <div class="exp-avatar">${p.emoji}</div>
        <div class="exp-match-pill">${p.match}% Match</div>
      </div>
      <div class="exp-name">${p.name}</div>
      <div class="exp-school">${p.school}</div>
      <div class="exp-year-loc">${p.year} · ${p.location}</div>
      <div class="exp-rating-row">
        <span style="color:#f5b731">★</span> ${p.rating} · ${p.sessions} sessions
      </div>
      <div style="font-size:0.68rem;color:var(--muted2);margin:8px 0 4px;font-weight:600;">🎓 Teaches:</div>
      <div class="exp-skills">${p.offers.slice(0,3).map(s=>`<span class="skill-chip">${s}</span>`).join('')}</div>
      <div style="font-size:0.68rem;color:var(--muted2);margin:6px 0 4px;font-weight:600;">🎯 Wants:</div>
      <div class="exp-skills">${p.wants.slice(0,2).map(s=>`<span class="skill-chip want">${s}</span>`).join('')}</div>
      <div class="exp-actions" style="margin-top:12px;">
        <button class="btn-primary" style="flex:1;font-size:0.8rem;padding:9px;" onclick="if(!isLoggedIn){showToast('Please log in to view profiles 🔐','warning');openModal('loginModal');}else{showUserProfile('${p.name}');}">
          👤 View Profile
        </button>
        <button class="btn-ghost" style="font-size:0.8rem;padding:9px;" onclick="connectUser(this,'${p.name}')">
          🤝 Connect
        </button>
      </div>
    </div>
  `).join('');

  if (typeof observeReveal === 'function') observeReveal();
}

/* ── Filter for enhanced explore ── */
function filterExploreEnhanced(tag) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.explore-card').forEach(card => {
    const cardTag = card.getAttribute('data-tags');
    card.style.display = (tag === 'all' || cardTag === tag) ? '' : 'none';
  });
}

/* ── Search for enhanced explore ── */
function searchSkillsEnhanced(val) {
  const q = val.toLowerCase();
  document.querySelectorAll('.explore-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? '' : 'none';
  });
}

/* ── Init on page load ── */
document.addEventListener('DOMContentLoaded', function() {
  // Override renderExploreCards
  if (typeof window !== 'undefined') {
    window.renderExploreCards = renderExploreCardsEnhanced;
    window.filterExplore = filterExploreEnhanced;
    window.searchSkills = searchSkillsEnhanced;
  }
  // Override showPage to handle explore
  const origShowPage = window.showPage;
  if (origShowPage) {
    const _orig = origShowPage;
    window.showPage = function(id) {
      // Remove user-profile page if navigating away
      if (id !== 'user-profile') {
        const up = document.getElementById('page-user-profile');
        if (up) up.remove();
      }
      _orig(id);
      if (id === 'explore') renderExploreCardsEnhanced();
    };
  }
  // Initial render
  setTimeout(() => {
    renderExploreCardsEnhanced();
  }, 100);
});
