# Contributing to SkillBridge

Thank you for your interest in contributing to SkillBridge! This document explains how to get involved.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/skillbridge.git
   cd skillbridge
   ```
3. **Open** `index.html` in your browser to verify everything works

## Making Changes

### Branch Naming

```
feature/your-feature-name    # New features
fix/issue-description        # Bug fixes
docs/what-you-changed        # Documentation only
style/what-you-changed       # CSS/visual changes only
```

### Commit Messages

Follow conventional commits:

```
feat: add LinkedIn import for resume parsing
fix: correct radar chart rendering on Firefox
docs: add API key setup instructions
style: improve mobile menu animation
refactor: extract toast system into separate module
```

### Code Style

- **JavaScript**: ES2020, no transpilation needed. Use `const`/`let`, arrow functions, template literals.
- **CSS**: Follow the existing CSS variable naming system. New colors go into `:root {}`.
- **HTML**: Semantic elements only. No `<div>` for interactive elements — use `<button>` or `<a>`.
- **No frameworks**: Keep it vanilla JS. No React, Vue, or build tools.
- **Comments**: Add a comment for any logic that isn't immediately obvious.

### Testing Your Changes

Before submitting a PR, test:

- [ ] Analysis page runs end-to-end (with a real API key)
- [ ] SkillSwap signup and login work
- [ ] Mobile view at 375px width
- [ ] Dark and light themes
- [ ] Streak and badge system triggers correctly
- [ ] No console errors in Chrome or Firefox

## Submitting a Pull Request

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a PR against `main`
3. Fill in the PR template:
   - What problem does this solve?
   - What did you change?
   - Screenshots (for UI changes)
   - Testing steps

## Reporting Bugs

Open a GitHub Issue with:
- Browser and OS
- Steps to reproduce
- Expected vs actual behaviour
- Console error (if any)

## Feature Requests

Open a GitHub Issue with the label `enhancement`. Describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you considered

## Code of Conduct

Be respectful, constructive, and kind. SkillBridge is built by a first-year student for students — everyone here is learning.

---

*Questions? Email bhargavi2048@gmail.com*
