# User Guide

## Getting Started

### Creating an Account

1. Navigate to the notg-reader application
2. Click "Register" on the login page
3. Enter a username (letters, numbers, hyphens, underscores)
4. Follow your browser's passkey prompt to set up passwordless authentication
5. Your account is created and you're logged in

### Signing In

1. Enter your username
2. Authenticate with your passkey (fingerprint, face ID, or security key)

## Subscribing to Feeds

### By URL

1. Click the **+** button in the sidebar under "Feeds"
2. Enter the RSS or Atom feed URL
3. Click "Add"

### Searching for Feeds

1. Navigate to the **Search** page using the sidebar or press `/`
2. Type your search query
3. Subscribe to feeds from the search results

## Reading Items

### Views

- **List View**: Shows only article titles for quick scanning
- **Expanded View**: Shows titles with content summaries
- Toggle between views using the view button (☰/▤) or press `v`

### Navigation

- Click on a feed in the sidebar to see items from that feed only
- Click "All Items" to see items from all subscriptions
- Use `j`/`k` keys to navigate between items
- Items are displayed newest first by default

### Sorting

- **By Date**: Chronological order (newest first)
- **By Relevance**: Prioritized by content matching

### Marking as Read

- **Manual**: Click the ✓ button on an item or press `m`
- **Automatic**: In expanded view, items are marked as read when scrolled past
- **Bulk**: Items scrolled past in expanded view are automatically marked

### Starring Items

- Click the ☆ button on any item or press `t` to toggle star
- Access all starred items from "⭐ Starred" in the sidebar or press `s`

## Labels

Labels help you organize items:

1. Go to an item
2. Assign labels from the item's actions
3. Create new labels in the Settings page
4. Filter items by label

## Search

1. Click "🔍 Search" in the sidebar or press `/`
2. Type your search query
3. Results search across all subscriptions (titles, content, summaries, authors)

## Sharing

- **Share an item**: Click the 📋 button on any item to copy its URL
- **Share a feed**: Click the 📋 button in the feed header to copy the feed URL

Both actions copy the URL to your clipboard for sharing.

## Settings

Access settings via "⚙️ Settings" in the sidebar:

### Display
- **View Mode**: Choose between List or Expanded view
- **Theme**: Light or Dark mode

### Offline Storage
- **Retention Period**: Choose how many days of items to keep for offline access
  - 7 days
  - 14 days
  - 30 days

### Subscriptions
- **Export OPML**: Download your subscription list as an OPML file
- **Import OPML**: Upload an OPML file to import subscriptions from another reader

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g` | Go to Home (All Items) |
| `s` | Go to Starred Items |
| `/` | Go to Search |
| `j` | Select next item |
| `k` | Select previous item |
| `m` | Mark selected item as read |
| `t` | Toggle star on selected item |
| `v` | Toggle between list and expanded view |
| `r` | Refresh current view |
| `?` | Show keyboard shortcuts help |

> **Note**: Keyboard shortcuts are disabled when typing in text fields.

## Offline Access

notg-reader supports offline reading:

1. Go to **Settings** → **Offline Storage**
2. Set your preferred retention period (7, 14, or 30 days)
3. Items you've viewed will be available offline
4. When offline, you can read cached items
5. Changes (read/star status) sync when you're back online

## Troubleshooting

### Can't register or log in
- Ensure your browser supports WebAuthn/Passkeys
- Try using a modern browser (Chrome, Firefox, Safari, Edge)
- Check that your device has a biometric sensor or security key

### Feeds not loading
- Verify the feed URL is correct and accessible
- Some feeds may require HTTPS
- Check your internet connection

### Items not showing
- Try refreshing the feed (🔄 button)
- Check if you have an active subscription to the feed
- Ensure the feed has published items
