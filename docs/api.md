# API Reference

Base URL: `/api`

## Authentication

All endpoints except `/api/health`, `/api/auth/register/*`, `/api/auth/login/*`, and `/api/auth/logout` require authentication.

Authentication is done via JWT tokens stored in httpOnly cookies. The token is set after successful registration or login.

### POST /api/auth/register/start

Start the WebAuthn registration process.

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric with hyphens/underscores)"
}
```

**Response:**
```json
{
  "options": { "...WebAuthn PublicKeyCredentialCreationOptions..." },
  "userId": "string"
}
```

### POST /api/auth/register/finish

Complete the WebAuthn registration.

**Request Body:**
```json
{
  "userId": "string",
  "response": { "...WebAuthn RegistrationResponse..." }
}
```

**Response:**
```json
{
  "verified": true
}
```

### POST /api/auth/login/start

Start the WebAuthn authentication process.

**Request Body:**
```json
{
  "username": "string"
}
```

### POST /api/auth/login/finish

Complete the WebAuthn authentication.

**Request Body:**
```json
{
  "userId": "string",
  "response": { "...WebAuthn AuthenticationResponse..." }
}
```

### POST /api/auth/logout

Clear the authentication cookie.

### GET /api/auth/me

Get the current authenticated user's profile.

### PUT /api/auth/profile

Update user profile.

**Request Body:**
```json
{
  "displayName": "string (optional)",
  "email": "string (optional, stored encrypted)"
}
```

## Feeds

### GET /api/feeds

Get all feed subscriptions for the authenticated user.

### POST /api/feeds/subscribe

Subscribe to a feed.

**Request Body:**
```json
{
  "url": "string (valid URL)",
  "title": "string (optional, max 200 chars)"
}
```

### DELETE /api/feeds/:subscriptionId

Unsubscribe from a feed.

### POST /api/feeds/:feedId/refresh

Refresh a feed to fetch new items.

### GET /api/feeds/search?q=query

Search for feeds by title, description, or URL.

## Items

### GET /api/items

Get feed items for the authenticated user.

**Query Parameters:**
- `feedId` - Filter by feed ID
- `isRead` - Filter by read status (`true`/`false`)
- `isStarred` - Filter by starred status (`true`/`false`)
- `labelId` - Filter by label ID
- `sort` - Sort order (`date` or `relevance`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)

### POST /api/items/read

Mark multiple items as read.

**Request Body:**
```json
{
  "feedItemIds": ["string", "string"]
}
```

### POST /api/items/:feedItemId/read

Mark a single item as read.

### POST /api/items/:feedItemId/star

Toggle star status on an item.

**Response:**
```json
{
  "isStarred": true
}
```

## Labels

### GET /api/labels

Get all labels for the authenticated user.

### POST /api/labels

Create a new label.

**Request Body:**
```json
{
  "name": "string (1-50 chars)",
  "color": "string (optional, hex color e.g. #ff0000)"
}
```

### DELETE /api/labels/:labelId

Delete a label.

### POST /api/labels/assign

Assign a label to a feed item.

**Request Body:**
```json
{
  "feedItemId": "string",
  "labelId": "string"
}
```

### POST /api/labels/unassign

Remove a label from a feed item.

**Request Body:**
```json
{
  "feedItemId": "string",
  "labelId": "string"
}
```

## OPML

### GET /api/opml/export

Export subscriptions as OPML XML file.

**Response:** `application/xml` OPML file

### POST /api/opml/import

Import subscriptions from OPML content.

**Request Body:**
```json
{
  "opml": "string (OPML XML content)"
}
```

**Response:**
```json
{
  "imported": 5,
  "errors": ["string"]
}
```

## Search

### GET /api/search?q=query

Search across all subscribed feed items.

**Query Parameters:**
- `q` - Search query (required)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50, max: 100)

## Settings

### GET /api/settings

Get user settings.

### PUT /api/settings

Update user settings.

**Request Body:**
```json
{
  "viewMode": "list | expanded",
  "offlineRetention": "7 | 14 | 30",
  "theme": "light | dark"
}
```

## Health

### GET /api/health

Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
