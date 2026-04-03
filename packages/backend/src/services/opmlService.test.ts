import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('../utils/db.js', () => {
  const mockSubscriptions = [
    {
      id: 'sub-1',
      title: 'Custom Title',
      feed: {
        id: 'feed-1',
        url: 'https://example.com/feed.xml',
        title: 'Example Feed',
        siteUrl: 'https://example.com',
      },
    },
    {
      id: 'sub-2',
      title: null,
      feed: {
        id: 'feed-2',
        url: 'https://blog.example.com/rss',
        title: 'Blog Feed',
        siteUrl: 'https://blog.example.com',
      },
    },
  ];

  return {
    getDb: () => ({
      subscription: {
        findMany: vi.fn().mockResolvedValue(mockSubscriptions),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'new-sub' }),
      },
      feed: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'new-feed', ...data })),
      },
    }),
  };
});

describe('opmlService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export subscriptions as OPML', async () => {
    const { exportOpml } = await import('./opmlService.js');
    const opml = await exportOpml('user-1');
    expect(opml).toContain('<?xml');
    expect(opml).toContain('<opml');
    expect(opml).toContain('Custom Title');
    expect(opml).toContain('https://example.com/feed.xml');
    expect(opml).toContain('Blog Feed');
  });

  it('should import OPML content', async () => {
    const { importOpml } = await import('./opmlService.js');
    const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <opml version="1.0">
      <head><title>Test</title></head>
      <body>
        <outline text="Test Feed" title="Test Feed" type="rss" xmlUrl="https://test.com/feed.xml" htmlUrl="https://test.com"/>
      </body>
    </opml>`;

    const result = await importOpml('user-1', opmlContent);
    expect(result.imported).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('should reject invalid OPML', async () => {
    const { importOpml } = await import('./opmlService.js');
    await expect(importOpml('user-1', 'not xml at all <>')).rejects.toThrow();
  });
});
