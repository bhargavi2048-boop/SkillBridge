# SkillBridge — Enhanced v2.0
### Map Your Gaps. Swap Your Skills. Grow Together.

> **AI-powered career gap analysis + peer-to-peer skill exchange, fully responsive and feature-complete.**

---

## What's New in v2.0

### Individual User Profile Pages (NEW)
Each person on the **Explore** page now has a **fully working "View Profile" button** that opens a rich, dedicated profile page:

- Full profile hero — avatar, name, university, year, location, rating, match %
- About section — personal bio, language, level, location metadata  
- Achievements & Badges — earned badges per user
- Skills Teaching — all skills the person offers
- Skills Wanted — what they want to learn
- Availability — weekly schedule slots
- Student Reviews — review cards with ratings
- **Book a Session** — prominent CTA button on every profile page

### Book Session Button on Profile Pages (NEW)
Every individual profile page features multiple Book a Session buttons:
- Hero area (desktop sidebar)
- Dedicated Book CTA card (right column, desktop)
- Sticky floating button (mobile)

### Full Responsive Design (OVERHAULED)
The entire site is redesigned for all screen sizes from 320px to 1440px+.

---

## Project Structure

```
skillbridge-enhanced/
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── app.js
│   ├── skillswap.js
│   ├── mapmyskills-app.js
│   ├── job-profiles.js
│   ├── report-generator.js
│   ├── streak-gamification.js
│   ├── platform.js
│   └── user-profile.js          ← NEW: Individual profile pages
├── README.md
├── DOCUMENTATION.md
├── CONTRIBUTING.md
├── LICENSE
└── SkillBridge_Project_Documentation.pdf
```

---

## Quick Start

No build tools needed. Pure HTML/CSS/JS.

```bash
# Unzip and open
cd skillbridge-enhanced
open index.html

# Or serve locally
npx serve .
# or
python3 -m http.server 8080
```

---

## Explore → View Profile Flow

1. Click **Explore** in the nav
2. Browse or search/filter people
3. Click **View Profile** on any card
4. Full profile page loads
5. Click **Book a Session** to open booking modal
6. Pick date, time, session type, topic
7. Confirm booking — success toast appears

> Login required: Use Sign Up to create a demo account instantly.

---

## Features

- MapMySkills: AI career gap analysis + 30-day roadmap
- SkillSwap: Browse, filter, view profiles, book sessions
- Dashboard: Progress bars, badges, streak tracking
- Career Domains: 10+ domain cards with skill mapping
- Gamification: Streaks, badges, leaderboard

---

## Design System

| Token | Value | Usage |
|---|---|---|
| --accent | #00d4c8 | Primary teal |
| --accent3 | #7c5cfc | Purple |
| --green | #22d1a3 | Success |
| --gold | #f5b731 | Ratings |

Fonts: Sora (headings), Plus Jakarta Sans (body)

---

## License

MIT — see LICENSE for details.

*SkillBridge v2.0 — Individual profiles, full responsiveness, pro UX.*
