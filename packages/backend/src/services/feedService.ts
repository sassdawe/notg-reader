import Parser from 'rss-parser';
import { getDb } from '../utils/db.js';
import { sanitizeContent, sanitizeText } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'notg-reader/0.1.0',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
  },
});

export interface ParsedFeed {
  title: string;
  description?: string;
  link?: string;
  image?: string;
  items: ParsedFeedItem[];
}

export interface ParsedFeedItem {
  guid: string;
  title: string;
  link?: string;
  content?: string;
  summary?: string;
  author?: string;
  publishedAt?: Date;
}

export async function fetchAndParseFeed(url: string): Promise<ParsedFeed> {
  const feed = await parser.parseURL(url);

  return {
    title: sanitizeText(feed.title || 'Untitled Feed'),
    description: feed.description ? sanitizeText(feed.description) : undefined,
    link: feed.link,
    image: feed.image?.url,
    items: (feed.items || []).map((item) => ({
      guid: item.guid || item.link || item.title || String(Date.now()),
      title: sanitizeText(item.title || 'Untitled'),
      link: item.link,
      content: item.content ? sanitizeContent(item.content) : undefined,
      summary: item.contentSnippet ? sanitizeText(item.contentSnippet) : undefined,
      author: item.creator || item.author,
      publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
    })),
  };
}

export async function subscribeFeed(userId: string, feedUrl: string, customTitle?: string) {
  const db = getDb();

  // Find or create feed
  let feed = await db.feed.findUnique({ where: { url: feedUrl } });

  if (!feed) {
    const parsed = await fetchAndParseFeed(feedUrl);
    feed = await db.feed.create({
      data: {
        url: feedUrl,
        title: parsed.title,
        description: parsed.description,
        siteUrl: parsed.link,
        imageUrl: parsed.image,
        lastFetchedAt: new Date(),
      },
    });

    // Store initial items
    if (parsed.items.length > 0) {
      await db.$transaction(
        parsed.items.map((item) =>
          db.feedItem.upsert({
            where: { feedId_guid: { feedId: feed!.id, guid: item.guid } },
            create: {
              feedId: feed!.id,
              guid: item.guid,
              title: item.title,
              link: item.link,
              content: item.content,
              summary: item.summary,
              author: item.author,
              publishedAt: item.publishedAt,
            },
            update: {},
          }),
        ),
      );
    }
  }

  const existingSubscription = await db.subscription.findUnique({
    where: { userId_feedId: { userId, feedId: feed.id } },
    include: { feed: true },
  });

  if (existingSubscription) {
    return existingSubscription;
  }

  // Create subscription
  const subscription = await db.subscription.create({
    data: {
      userId,
      feedId: feed.id,
      title: customTitle,
    },
    include: { feed: true },
  });

  return subscription;
}

export async function refreshFeed(feedId: string) {
  const db = getDb();
  const feed = await db.feed.findUnique({ where: { id: feedId } });
  if (!feed) return;

  try {
    const parsed = await fetchAndParseFeed(feed.url);

    await db.feed.update({
      where: { id: feedId },
      data: {
        title: parsed.title,
        description: parsed.description,
        siteUrl: parsed.link,
        imageUrl: parsed.image,
        lastFetchedAt: new Date(),
        lastError: null,
      },
    });

    if (parsed.items.length > 0) {
      await db.$transaction(
        parsed.items.map((item) =>
          db.feedItem.upsert({
            where: { feedId_guid: { feedId, guid: item.guid } },
            create: {
              feedId,
              guid: item.guid,
              title: item.title,
              link: item.link,
              content: item.content,
              summary: item.summary,
              author: item.author,
              publishedAt: item.publishedAt,
            },
            update: {},
          }),
        ),
      );
    }

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error refreshing feed ${feedId}: ${message}`);
    await db.feed.update({
      where: { id: feedId },
      data: { lastError: message },
    });
    throw error;
  }
}

export async function unsubscribeFeed(userId: string, subscriptionId: string) {
  const db = getDb();
  const subscription = await db.subscription.findFirst({
    where: { id: subscriptionId, userId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  await db.subscription.delete({ where: { id: subscriptionId } });

  // Clean up user items for this feed
  const feedItems = await db.feedItem.findMany({
    where: { feedId: subscription.feedId },
    select: { id: true },
  });
  const feedItemIds = feedItems.map((item) => item.id);
  if (feedItemIds.length > 0) {
    await db.userItem.deleteMany({
      where: { userId, feedItemId: { in: feedItemIds } },
    });
  }

  // Check if feed has other subscribers
  const otherSubs = await db.subscription.count({
    where: { feedId: subscription.feedId },
  });
  if (otherSubs === 0) {
    await db.feed.delete({ where: { id: subscription.feedId } });
  }
}

export async function getUserFeeds(userId: string) {
  const db = getDb();
  return db.subscription.findMany({
    where: { userId },
    include: {
      feed: {
        include: {
          _count: { select: { items: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function searchFeeds(query: string) {
  const db = getDb();
  return db.feed.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { url: { contains: query } },
      ],
    },
    take: 20,
  });
}
