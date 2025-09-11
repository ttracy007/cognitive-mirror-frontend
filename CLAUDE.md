# Cognitive Mirror Frontend - Claude Development Notes

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

Complete frontend/backend integration docs are in the backend repo at:

**`/Users/mac/Projects/cognitive-mirror-backend-dev/INTEGRATION.md`**

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
2. **If yes** - Document in `INTEGRATION-CHANGES.md` using the provided template
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

If **any** checkbox is checked, document the change in `INTEGRATION-CHANGES.md` immediately.

## Mobile Optimizations

- Pinch-zoom detection to prevent scroll conflicts
- Collapsible input container for better screen utilization
- Touch-aware scrolling with iOS optimizations
- Mobile-specific debug overlays for troubleshooting

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

---
*Last updated: 2025-01-10*