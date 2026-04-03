# Developer Guide

## Architecture Overview

notg-reader is a full-stack TypeScript application built as a monorepo with two packages:

- **@notg-reader/backend**: Express.js REST API with Prisma ORM
- **@notg-reader/frontend**: React SPA with Vite bundler

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, CSS Modules |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | SQLite (via Prisma, swappable) |
| Authentication | WebAuthn (SimpleWebAuthn) |
| Testing | Vitest, Testing Library, Supertest |
| Deployment | Docker, Kubernetes, Azure |

## Development Workflow

### Prerequisites

- Node.js 22 or later
- npm 10 or later
- Git

### Environment Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/sassdawe/notg-reader.git
   cd notg-reader
   npm install
   ```

2. Configure the backend:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   ```

3. Initialize the database:
   ```bash
   npm run db:push -w @notg-reader/backend
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

### Test-Driven Development

This project follows TDD practices. When adding new features:

1. Write failing tests first
2. Implement the minimum code to pass
3. Refactor while keeping tests green

```bash
# Watch mode for rapid TDD cycles
npm run test:watch -w @notg-reader/backend
npm run test:watch -w @notg-reader/frontend
```

### Code Quality

- **TypeScript**: Strict mode enabled. All code must type-check.
- **ESLint**: Enforced via `npm run lint`.
- **Prettier**: Format on save (configured in `.prettierrc`).

### Database Changes

The project uses Prisma ORM with SQLite:

```bash
# After modifying prisma/schema.prisma:
npm run db:migrate -w @notg-reader/backend    # Create migration
npm run db:generate -w @notg-reader/backend   # Regenerate client
npm run db:push -w @notg-reader/backend       # Push schema (dev only)
```

### Adding New API Routes

1. Create a test file in `packages/backend/src/routes/` or `packages/backend/src/services/`
2. Write tests for the expected behavior
3. Create the route handler in `packages/backend/src/routes/`
4. Add business logic in `packages/backend/src/services/`
5. Register the route in `packages/backend/src/app.ts`
6. Use Zod schemas for input validation
7. Use the `validate` middleware for request validation
8. Wrap route handlers with `requireAuth` for protected routes

### Adding New Frontend Pages

1. Create test file in `packages/frontend/src/pages/`
2. Create page component
3. Add route in `packages/frontend/src/App.tsx`
4. Add navigation link in `packages/frontend/src/components/Sidebar.tsx`

### Security Practices

- All user input is validated with Zod schemas
- HTML content from feeds is sanitized with `sanitize-html`
- Profile data (email) is encrypted at rest with AES-256-GCM
- CSRF protection via `X-Requested-With` header validation
- Rate limiting on all API endpoints
- JWT tokens stored in httpOnly cookies
- Helmet.js for security headers
- No secrets in source code

### Extending Authentication

The auth system is designed to be extensible. To add a new identity provider:

1. Create a new service in `packages/backend/src/services/` (e.g., `oauthService.ts`)
2. Add routes in `packages/backend/src/routes/auth.ts`
3. The `User` model supports multiple authenticators per user
4. Use the existing `createToken` function to issue JWT tokens after authentication

### Offline Support

The frontend uses:
- **Service Worker** (`public/sw.js`): Caches static assets for offline access
- **IndexedDB** (`utils/offlineStorage.ts`): Stores feed items for offline reading
- Configurable retention: 7, 14, or 30 days
