# SkillBridge v2.0 — Technical Documentation

## Architecture Overview

SkillBridge is a single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open `index.html` in a browser.

### Page Routing

Pages are `<div class="page" id="page-{name}">` elements. The `showPage(id)` function in `app.js` toggles the `active` class:

```javascript
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById("page-" + id);
  if (page) { page.classList.add("active"); window.scrollTo(0, 0); }
}
```

The **user profile pages** are dynamically created and injected into the DOM by `user-profile.js`:

```javascript
function showUserProfile(personName) {
  const data = EXPLORE_PROFILES[personName];
  const newPage = /* generate HTML */;
  document.body.appendChild(newPage);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  newPage.classList.add('active');
}
```

---

## File Reference

### `js/user-profile.js` (NEW in v2.0)

The core new file. Contains:

| Export | Description |
|---|---|
| `EXPLORE_PROFILES` | Object map of name → full profile data for all 12 explore users |
| `showUserProfile(name)` | Generates and shows a full profile page for a given person |
| `renderExploreCardsEnhanced()` | Replaces `renderExploreCards` with richer cards + working View Profile buttons |
| `filterExploreEnhanced(tag)` | Category filter override |
| `searchSkillsEnhanced(val)` | Search override |

**Profile data shape:**
```javascript
{
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
  bio: '...',
  offers: ['Python', 'Machine Learning', ...],
  wants: ['Guitar', 'Spanish', ...],
  badges: ['🥇 Top Teacher', ...],
  reviews: [{ name, emoji, rating, text }, ...],
  availability: ['Mon 6-8 PM', ...],
  level: 'Advanced',
  language: 'English, Tamil, Hindi'
}
```

### `js/app.js`

Core routing, tab switching, theme toggle, counter animations, scroll reveal.

### `js/skillswap.js`

SkillSwap feature: login/signup flow, profile editing, connect users, schedule modal, booking handler, streak hooks.

### `js/mapmyskills-app.js`

MapMySkills feature: resume upload/paste, Claude AI API call, gap analysis rendering, 30-day roadmap, skill radar chart.

### `js/streak-gamification.js`

Streak tracking, badge unlocking, gamification events.

### `css/main.css`

All styles including:
- CSS custom properties (design tokens)
- Component styles
- Page-specific styles
- User profile page styles (`.up-*` prefix)
- Comprehensive responsive media queries

---

## User Profile Page — DOM Structure

```
#page-user-profile
└── .up-section
    ├── .up-back-btn              ← "← Back to Explore"
    ├── .up-hero-card
    │   ├── .up-hero-left
    │   │   ├── .up-avatar-wrap  ← emoji + online dot
    │   │   └── .up-hero-info    ← name, school, rating, match badge
    │   └── .up-hero-right
    │       ├── .up-hero-stats   ← sessions, connections, rating pills
    │       └── .up-cta-group    ← Book Session, Message, Connect
    ├── .up-content-grid
    │   ├── .up-left-col
    │   │   ├── .up-card (About)
    │   │   ├── .up-card (Achievements)
    │   │   ├── .up-card (Skills Teaching)
    │   │   └── .up-card (Skills Wanting)
    │   └── .up-right-col
    │       ├── .up-book-card    ← Book CTA (desktop only)
    │       ├── .up-card (Availability)
    │       └── .up-card (Reviews)
    └── .up-mobile-cta           ← Sticky bottom bar (mobile only)
```

---

## Book Session Flow

```
User clicks "Book a Session"
  ↓
isLoggedIn check
  ├── false → showToast + openModal('loginModal')
  └── true  → openScheduleModal(name)
                ↓
              Modal: date, time, type, topic
                ↓
              handleSchedule(event)
                ↓
              closeModal + showToast('Session booked!')
                ↓
              onSessionBooked() → streak/gamification hook
```

---

## Responsive Design System

### Breakpoints

```css
/* Mobile phones */
@media (max-width: 480px) { ... }

/* Phones & tablets */
@media (max-width: 768px) { ... }

/* User profile 2-col → 1-col */
@media (max-width: 960px) { ... }

/* Dashboard grid */
@media (max-width: 1024px) { ... }
```

### Mobile-Specific UX
- Horizontal-scrollable filter tabs (no wrap)
- Sticky bottom Book Session CTA on profile pages
- Collapsed nav with hamburger menu
- Touch target minimum 44px height
- `-webkit-tap-highlight-color: transparent` on cards

---

## CSS Architecture

### Naming Conventions
- `.up-*` — User Profile page components
- `.exp-*` — Explore page components  
- `.dash-*` — Dashboard components
- `.btn-*` — Button variants
- `.modal-*` — Modal components
- `.skill-chip` — Skill tag chips

### CSS Custom Properties (Design Tokens)

```css
--accent: #00d4c8;       /* Primary teal */
--accent2: #00b4f0;      /* Blue */
--accent3: #7c5cfc;      /* Purple */
--green: #22d1a3;        /* Success */
--gold: #f5b731;         /* Ratings */
--danger: #ff4d6a;       /* Error */
--bg1: #0a0e1a;          /* Dark background */
--bg2: #111827;          /* Card background */
--surface: #141b2d;      /* Surface */
--border: rgba(255,255,255,0.08);
--text: #f0f4ff;         /* Primary text */
--muted: rgba(160,175,210,0.5);
--muted2: rgba(160,175,210,0.75);
--font-head: 'Sora', sans-serif;
--font-body: 'Plus Jakarta Sans', sans-serif;
```

---

## Adding New Profile Users

To add a new person to the Explore page, add an entry to `EXPLORE_PROFILES` in `user-profile.js`:

```javascript
'Your Name': {
  emoji: '🧑‍💻',
  name: 'Your Name',
  school: 'University · Department',
  year: '3rd Year B.Tech',
  location: 'City, State',
  rating: 4.7,
  sessions: 20,
  connections: 15,
  match: 85,
  tags: 'tech',  // tech | design | music | language | math | business
  bio: 'Your bio here...',
  offers: ['Skill 1', 'Skill 2', 'Skill 3'],
  wants: ['Skill A', 'Skill B'],
  badges: ['🏆 Badge Name'],
  reviews: [{ name: 'Reviewer', emoji: '👤', rating: 5, text: 'Review text' }],
  availability: ['Mon 5-7 PM', 'Sat 10 AM-12 PM'],
  level: 'Beginner to Advanced',
  language: 'English, Hindi'
}
```

---

## Known Limitations (Demo Mode)

- All bookings are local only (no backend)
- Messages are simulated with toast notifications
- Data is stored in `localStorage` — clears on browser data wipe
- Claude AI integration requires a valid API key in production

---

## Deployment

```bash
# Any static hosting works
# Vercel
vercel deploy

# Netlify — drag and drop the folder
# GitHub Pages — push to gh-pages branch
# Firebase Hosting
firebase deploy

# Local test
python3 -m http.server 8080
```

---

*SkillBridge v2.0 Technical Documentation — Last updated April 2026*
