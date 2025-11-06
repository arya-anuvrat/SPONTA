# SPONTA Git Workflow Guide

## Quick Reference

### Daily Workflow

1. **Start your day:**
   ```bash
   git checkout main
   git pull origin main
   git checkout arnav  # or your branch name
   git merge main  # Get latest changes
   ```

2. **Make your changes:**
   ```bash
   # Work on your code
   git add .
   git commit -m "Description of changes"
   git push origin arnav  # Push to your branch
   ```

3. **When ready to merge:**
   - Go to GitHub: https://github.com/arya-anuvrat/SPONTA
   - Click "Pull requests" → "New pull request"
   - Select: `arnav` → `main` (or your branch → main)
   - Add description and create PR
   - Wait for team member review
   - After approval, merge to main

4. **After merging:**
   ```bash
   git checkout main
   git pull origin main
   git checkout arnav
   git merge main  # Update your branch
   ```

---

## Branch Names

- `main` - Default branch (production-ready code)
- `anuvrat` - Anuvrat's working branch
- `arnav` - Arnav's working branch
- `sukrit` - Sukrit's working branch
- `suraj` - Suraj's working branch

---

## Important Rules

✅ **DO:**
- Always work on your personal branch
- Pull latest from main before starting new work
- Create PRs for all changes
- Get at least one review before merging
- Write clear commit messages

❌ **DON'T:**
- Push directly to main
- Merge without review
- Work on outdated code
- Force push to shared branches

---

## Common Commands

```bash
# Switch to main and update
git checkout main
git pull origin main

# Switch to your branch
git checkout arnav

# Update your branch with latest main
git merge main

# Push your changes
git push origin arnav

# Create a new feature branch (if needed)
git checkout -b feature-name
```

---

## Pull Request Template

When creating a PR, include:
- What you changed
- Why you changed it
- How to test it
- Screenshots (if UI changes)

---

**Happy Coding! 🚀**

