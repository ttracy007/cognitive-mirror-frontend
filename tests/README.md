# Frontend Testing Guide

## Test Directory Structure

/tests/
├── components/       # Component tests (React Testing Library)
├── integration/      # Integration tests (full feature flows)
├── e2e/             # End-to-end tests (Cypress/Playwright)
├── utils/           # Utility function tests
└── __mocks__/       # Test mocks and fixtures

## Running Tests

```bash
# Run all tests
npm test

# Run component tests
npm run test:components

# Run integration tests
npm run test:integration
```

## Creating New Tests

### Component Tests
Place in /tests/components/[ComponentName].test.js

### Integration Tests
Place in /tests/integration/[feature-name].test.js

### E2E Tests
Place in /tests/e2e/[user-flow].test.js