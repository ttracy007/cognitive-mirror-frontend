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

## Mobile Optimizations

- Pinch-zoom detection to prevent scroll conflicts
- Collapsible input container for better screen utilization
- Touch-aware scrolling with iOS optimizations
- Mobile-specific debug overlays for troubleshooting

## Environment Variables

Required environment variables:
- `REACT_APP_BACKEND_URL`: Custom backend API URL
- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key
- `REACT_APP_ENV`: Environment identifier

## Deployment

- Frontend deploys to Vercel
- Backend deploys to Render.com
- Requires CORS configuration for cross-origin requests

---
*Last updated: 2025-01-10*