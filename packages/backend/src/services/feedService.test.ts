import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
  feed: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  feedItem: {
    upsert: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('../utils/db.js', () => ({
  getDb: () => mockDb,
}));

describe('feedService.subscribeFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing subscription when user is already subscribed', async () => {
    const existingFeed = {
      id: 'feed-1',
      url: 'https://example.com/rss',
    };
    const existingSubscription = {
      id: 'sub-1',
      userId: 'user-1',
      feedId: 'feed-1',
      feed: existingFeed,
    };

    mockDb.feed.findUnique.mockResolvedValue(existingFeed);
    mockDb.subscription.findUnique.mockResolvedValue(existingSubscription);

    const { subscribeFeed } = await import('./feedService.js');
    const result = await subscribeFeed('user-1', 'https://example.com/rss');

    expect(result).toEqual(existingSubscription);
    expect(mockDb.subscription.create).not.toHaveBeenCalled();
  });
});
