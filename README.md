# notg-reader

An open-source RSS/Atom feed aggregator with passwordless authentication, offline support, and Azure deployment capability.

## Features

- **Feed Management**: Subscribe to RSS/Atom feeds via URL or built-in search
- **Passwordless Authentication**: WebAuthn/Passkey-based login (no passwords)
- **Extensible Auth**: Architecture supports additional identity providers
- **Multiple Views**: List view (titles only) or expanded view (with descriptions)
- **Organization**: Labels, starred items, and feed-based folders
- **Keyboard Shortcuts**: Navigate and manage feeds without a mouse
- **OPML Support**: Import and export subscription lists
- **Search**: Full-text search across all feed items
- **Offline Access**: Configurable offline storage (7/14/30 days)
- **Sharing**: Copy feed or item URLs to clipboard
- **Auto-Read Marking**: Items marked as read when scrolled past (expanded view)
- **Dark Mode**: Light and dark theme support
- **Secure by Default**: Encrypted profiles, CSRF protection, rate limiting, input sanitization
- **Deployable**: Docker, Azure AKS (Kubernetes), and Azure App Service

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+

### Development Setup

```bash
# Clone the repository
git clone https://github.com/sassdawe/notg-reader.git
cd notg-reader

# Install dependencies
npm install

# Set up backend environment
cp packages/backend/.env.example packages/backend/.env

# Initialize the database
npm run db:push -w @notg-reader/backend

# Start development servers
npm run dev
```

The frontend runs at `http://localhost:3000` and the backend at `http://localhost:3001`.

### GitHub Codespaces

Click the "Code" button on the repository page and select "Open with Codespaces". The devcontainer configuration will automatically:

1. Set up a Node.js 22 environment
2. Install all dependencies
3. Forward ports 3000 (frontend) and 3001 (backend)
4. Install recommended VS Code extensions

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm test -w @notg-reader/backend

# Run frontend tests only
npm test -w @notg-reader/frontend

# Run tests in watch mode
npm run test:watch -w @notg-reader/backend
npm run test:watch -w @notg-reader/frontend
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
notg-reader/
├── packages/
│   ├── backend/           # Express.js API server
│   │   ├── prisma/        # Database schema and migrations
│   │   ├── src/
│   │   │   ├── middleware/ # Auth, validation, error handling, CSRF
│   │   │   ├── routes/    # API route handlers
│   │   │   ├── services/  # Business logic (feeds, auth, OPML)
│   │   │   ├── utils/     # JWT, encryption, sanitization, logging
│   │   │   └── test/      # Test setup
│   │   └── vitest.config.ts
│   └── frontend/          # React SPA
│       ├── public/        # Static assets, service worker
│       ├── src/
│       │   ├── api/       # API client modules
│       │   ├── components/# Reusable UI components
│       │   ├── contexts/  # React context providers
│       │   ├── hooks/     # Custom React hooks
│       │   ├── layouts/   # Page layouts
│       │   ├── pages/     # Page components
│       │   ├── styles/    # Global CSS
│       │   ├── utils/     # Utilities (clipboard, dates, offline)
│       │   └── test/      # Test setup
│       └── vitest.config.ts
├── deploy/
│   ├── kubernetes/        # AKS deployment manifests
│   └── azure-app-service/ # App Service Bicep template + deploy script
├── Dockerfile             # Multi-stage production build
└── .devcontainer/         # GitHub Codespaces configuration
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

## API Reference

See [docs/api.md](docs/api.md) for the complete API documentation.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g` | Go to Home |
| `s` | Go to Starred Items |
| `/` | Go to Search |
| `j` | Next item |
| `k` | Previous item |
| `m` | Mark current item as read |
| `t` | Toggle star on current item |
| `v` | Toggle view mode (list/expanded) |
| `r` | Refresh items |
| `?` | Show keyboard shortcuts help |

## License

GPL-3.0 - See [LICENSE](LICENSE) for details.
