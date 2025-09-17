# Cognitive Mirror Frontend - Claude Development Notes

## 🚨 MANDATORY: Quality Control Protocols

### STOP - DIAGNOSE FIRST PROTOCOL
**Before ANY code changes, complete this checklist:**

#### 1. Evidence Collection (Required)
- [ ] Console logs showing actual errors (screenshots/text)
- [ ] Network tab showing API request/response data
- [ ] Database state verification (what data actually exists)
- [ ] Component state inspection (what values are present)

#### 2. Diagnostic Hierarchy (Complete in order)
- [ ] **Level 1: Data Source** - Is data in database? (Check Supabase directly)
- [ ] **Level 2: API Layer** - Is backend saving/returning data correctly?
- [ ] **Level 3: Transport Layer** - Is frontend sending correct requests?
- [ ] **Level 4: Display Layer** - Is frontend displaying existing data?

**RULE: Only proceed to next level after confirming previous level works**

#### 3. Root Cause vs Symptom Check
- [ ] Timeline not updating = **Data source problem**, not display problem
- [ ] API returns response but no DB entry = **Backend issue**, not frontend
- [ ] Multiple competing systems = **Architecture problem**, not timing issue

### CHANGE AUTHORIZATION MATRIX

**MINOR** (Immediate approval):
- CSS styling, text changes, visual adjustments

**MODERATE** (Evidence required):
- Component logic, state management
- Requires evidence-based justification before proceeding

**MAJOR** (Complete diagnostic protocol):
- Data flow changes, API integration modifications
- Must complete full diagnostic hierarchy first

**CRITICAL** (Human approval required):
- System architecture changes
- Multiple component modifications

### VERIFICATION PROTOCOL (Mandatory)
1. Make ONE minimal change
2. Test specific functionality immediately
3. Provide evidence that fix works (screenshots/logs)
4. Only then claim success
5. If test fails, revert change immediately before trying again

### FAILURE RECOVERY PROTOCOL
**After 3 failed attempts at same problem:**
1. STOP making changes immediately
2. Document all attempted solutions and their failures
3. Consider rollback to known working state
4. Re-evaluate problem from first principles using diagnostic hierarchy

## Project Overview

React-based frontend for the Cognitive Mirror journaling application with AI-powered responses and insights.

## Development Commands

```bash
# Start development server
npm start

# Build for production  
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Architecture

- **Frontend**: React with dual-backend integration
- **Authentication**: Supabase Auth with username-to-email conversion
- **Storage**: Supabase for user data and journal entries
- **AI Processing**: Custom backend API for OpenAI integration

## Key Features

- Real-time journal entry submission and AI responses
- 5 different AI personality modes (therapist, marcus, frank, movies, verena)
- Mobile-optimized UI with collapsible input and touch handling
- Pattern insights and mood analytics
- Theme-based journal filtering and insights

## Integration Documentation

**Single Source of Truth**: `/Users/mac/Projects/cognitive-mirror-backend-dev/INTEGRATION.md`

This includes:
- API endpoint specifications with request/response formats
- Database schema requirements  
- Authentication flow documentation
- Environment configuration and CORS setup
- Mobile optimization patterns
- Error handling strategies

### 🚨 Integration Change Detection System

**AUTOMATIC TRIGGERS** - When modifying these files, always check for backend integration impacts:

**API Integration Files:**
- `src/App.js` - Main API calls, authentication, journal submission
- `src/supabaseClient.js` - Database client and auth configuration  
- `src/components/JournalTimeline.js` - Data fetching and display
- `src/SummaryViewer.js` - Summary generation API calls
- `src/components/MoodModal.js` - Analytics API integration
- `src/components/FeedbackBar.js` - Feedback collection API
- `src/LoginPage.js` - Authentication flow

**Environment Configuration:**
- Platform environment variables (Render/Vercel) - Backend URLs, API keys, Supabase configuration
- `public/index.html` - Mobile viewport and CORS-related meta tags
- `package.json` - Development server configuration

**Integration Change Process:**
1. **Before committing** - Check if your changes affect backend integration
2. **If yes** - Document changes directly in backend integration guide, not in staging files
3. **Coordinate** - Notify backend team of pending changes
4. **Verify** - Test integration after backend updates are deployed
5. **Archive** - Move completed changes to archive section

**Integration Impact Checklist:**
- [ ] Does this change API request/response formats?
- [ ] Does this modify authentication flow?
- [ ] Does this add/remove API endpoints?
- [ ] Does this change environment variables?
- [ ] Does this affect CORS requirements?
- [ ] Does this impact mobile-specific backend needs?

If **any** checkbox is checked, document the change directly in backend integration guide immediately.

## Mobile Optimizations

- Pinch-zoom detection to prevent scroll conflicts
- Collapsible input container for better screen utilization
- Touch-aware scrolling with iOS optimizations
- Environment-based debug overlays (development only)

## Environment Configuration Management

### 🚨 No More .env Merge Conflicts!

**Solution:** `.env` is now gitignored and managed through platform environment variables only.

**Environment Management:**
- **Local Development**: Create your own `.env` file locally (not committed)
- **Render.com (Backend)**: Set environment variables in Render dashboard
- **Vercel (Frontend)**: Set environment variables in Vercel dashboard
- **No .env files tracked in git** - eliminates merge conflicts completely

**Required Environment Variables:**
- `REACT_APP_BACKEND_URL`: Backend API URL (dev vs prod)
- `REACT_APP_SUPABASE_URL`: Supabase project URL  
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key
- `REACT_APP_ENV`: Environment identifier (dev/demo)

**Platform Configuration:**
- **Dev Branch**: Configure dev backend URLs in platform
- **Master Branch**: Configure production backend URLs in platform
- **Automatic deployment** with correct environment per branch

## Deployment

- Frontend deploys to Vercel
- Backend deploys to Render.com
- Requires CORS configuration for cross-origin requests

## Git Merge Strategy

### Common Merge Conflicts & Resolutions

**BEFORE MERGING DEV TO MASTER:**
1. **Clean dev branch first**: Remove .env files, ignore cache conflicts
2. **Expect cache conflicts**: `node_modules/.cache/` files ALWAYS conflict - ignore them
3. **Environment files**: `.env` should NOT be merged between branches
4. **Binary file conflicts**: Accept all cache file conflicts automatically

**Recommended Merge Strategy:**
```bash
# In master worktree
cd /Users/mac/Projects/cognitive-mirror-frontend
git checkout master
git merge dev --strategy-option=ours node_modules/.cache/
git rm .env  # Always remove environment files 
git add .
git commit -m "Merge dev: [description] - resolve cache conflicts"
git push origin master
```

**Common Conflict Files to Ignore:**
- `node_modules/.cache/.eslintcache`
- `node_modules/.cache/default-development/*.pack`
- `.env` (should be gitignored)

## Git Worktree Protocol

**Repository Structure:**
- **Dev Worktree**: `/Users/mac/Projects/cognitive-mirror-frontend-dev` (dev branch)
- **Master Worktree**: `/Users/mac/Projects/cognitive-mirror-frontend` (master branch)

**Deployment Commands (Copy exactly):**
```bash
# 1. Push dev changes
git push origin dev

# 2. Merge dev to master (from dev worktree)
git -C /Users/mac/Projects/cognitive-mirror-frontend merge dev

# 3. Push master to production
git -C /Users/mac/Projects/cognitive-mirror-frontend push origin master
```

**Critical Rules:**
- Always use `-C` flag with full path for cross-worktree operations
- Never try to checkout master from dev worktree
- Never change working directory - use `git -C` instead

## Claude Cognitive Bias Corrections

### Anti-Scope-Escalation Protocol
**BEFORE implementing ANY solution:**
- What is the MINIMAL change that solves this specific problem?
- Am I adding features that weren't requested?
- Could this be solved by changing 1-3 lines instead of rewriting components?

### Diagnosis-First Protocol  
**BEFORE assuming code is broken:**
- Is this a deployment/environment issue?
- Is the "working version" actually deployed and running?
- What specific evidence proves the code logic is wrong?

### Simplicity-First Hierarchy
**WHEN multiple solutions exist:**
1. Environment/config change (preferred)
2. Single-line code modification
3. Component modification  
4. Architecture change (last resort)

**NEVER start with #4 for simple issues**

### Context Disambiguation
**"Working version" requires clarification:**
- Working deployed = Live production behavior
- Working local = Local development behavior  
- Working git = Previous commit state

**These are often different - always specify which one**

### Common Anti-Patterns to Avoid
- ❌ Rewriting components when the issue is CORS/environment
- ❌ Adding manual controls when auto-functionality works fine
- ❌ Assuming code logic is wrong before checking deployment status
- ❌ Over-engineering solutions when 1-line fixes exist

---
*Last updated: 2025-01-15*