# Frontend-Backend Integration Documentation

## 📍 Integration Guide Location

Complete frontend-backend integration documentation is maintained in the backend repository at:

**`/Users/mac/Projects/cognitive-mirror-backend-dev/INTEGRATION.md`**

## 📋 What's Documented

The integration guide covers:

- **API Endpoints**: All 7 endpoints the frontend calls with request/response formats
- **Authentication Flow**: Supabase auth integration and user management  
- **Data Structures**: Database schema and expected data formats
- **Environment Config**: Required environment variables and CORS setup
- **Error Handling**: Network error patterns, health checks, and server wake-up
- **Mobile Patterns**: Touch handling, performance optimizations, and debugging
- **Security**: User data isolation, API key management, and session handling
- **Voice System**: 5 AI personality modes and tone configurations

## 🔄 Dual-Backend Architecture

This frontend integrates with:
- **Supabase**: Authentication, user data, journal storage
- **Custom Backend**: AI processing, insights, analytics

## 🚀 Quick Start for Backend Developers

1. Review the integration guide in the backend repo
2. Set up required CORS headers for frontend domain
3. Implement the 7 documented API endpoints
4. Connect to the shared Supabase instance
5. Test with provided request/response examples

---
*Last updated: 2025-01-10*
*Frontend repo: cognitive-mirror-frontend-dev*
*Backend repo: cognitive-mirror-backend-dev*