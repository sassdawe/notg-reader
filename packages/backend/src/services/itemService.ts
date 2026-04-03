import { getDb } from '../utils/db.js';

export type SortOrder = 'date';

export async function getUserItems(
  userId: string,
  options: {
    feedId?: string;
    isRead?: boolean;
    isStarred?: boolean;
    labelId?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const db = getDb();
  const { feedId, isRead, isStarred, labelId, page = 1, limit = 50 } = options;

  // Build where clause
  const where: Record<string, unknown> = {};

  // Only show items from subscribed feeds
  const subscriptions = await db.subscription.findMany({
    where: { userId },
    select: { feedId: true },
  });
  const subscribedFeedIds = subscriptions.map((s) => s.feedId);

  if (feedId) {
    if (!subscribedFeedIds.includes(feedId)) {
      return { items: [], total: 0 };
    }
    where.feedId = feedId;
  } else {
    where.feedId = { in: subscribedFeedIds };
  }

  // Get feed items with user item data
  const feedItems = await db.feedItem.findMany({
    where: where as never,
    include: {
      feed: { select: { id: true, title: true, url: true, imageUrl: true } },
      userItems: {
        where: { userId },
        include: {
          labels: { include: { label: true } },
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Filter by read/starred/label status
  let filtered = feedItems.map((item) => {
    const userItem = item.userItems[0];
    return {
      id: item.id,
      feedId: item.feedId,
      feed: item.feed,
      guid: item.guid,
      title: item.title,
      link: item.link,
      content: item.content,
      summary: item.summary,
      author: item.author,
      publishedAt: item.publishedAt,
      isRead: userItem?.isRead ?? false,
      isStarred: userItem?.isStarred ?? false,
      readAt: userItem?.readAt,
      labels: userItem?.labels?.map((l) => l.label) ?? [],
      userItemId: userItem?.id,
    };
  });

  if (isRead !== undefined) {
    filtered = filtered.filter((item) => item.isRead === isRead);
  }
  if (isStarred !== undefined) {
    filtered = filtered.filter((item) => item.isStarred === isStarred);
  }
  if (labelId) {
    filtered = filtered.filter((item) =>
      item.labels.some((l) => l.id === labelId),
    );
  }

  const total = await db.feedItem.count({ where: where as never });

  return { items: filtered, total };
}

export async function markItemRead(userId: string, feedItemId: string) {
  const db = getDb();
  return db.userItem.upsert({
    where: {
      userId_feedItemId: { userId, feedItemId },
    },
    create: {
      userId,
      feedItemId,
      isRead: true,
      readAt: new Date(),
    },
    update: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function markItemsRead(userId: string, feedItemIds: string[]) {
  const db = getDb();
  return db.$transaction(
    feedItemIds.map((feedItemId) =>
      db.userItem.upsert({
        where: {
          userId_feedItemId: { userId, feedItemId },
        },
        create: {
          userId,
          feedItemId,
          isRead: true,
          readAt: new Date(),
        },
        update: {
          isRead: true,
          readAt: new Date(),
        },
      }),
    ),
  );
}

export async function toggleStarItem(userId: string, feedItemId: string) {
  const db = getDb();
  const existing = await db.userItem.findUnique({
    where: {
      userId_feedItemId: { userId, feedItemId },
    },
  });

  if (existing) {
    return db.userItem.update({
      where: { id: existing.id },
      data: { isStarred: !existing.isStarred },
    });
  }

  return db.userItem.create({
    data: {
      userId,
      feedItemId,
      isStarred: true,
    },
  });
}

export async function searchItems(userId: string, query: string, page = 1, limit = 50) {
  const db = getDb();
  
  const subscriptions = await db.subscription.findMany({
    where: { userId },
    select: { feedId: true },
  });
  const feedIds = subscriptions.map((s) => s.feedId);

  const items = await db.feedItem.findMany({
    where: {
      feedId: { in: feedIds },
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { summary: { contains: query } },
        { author: { contains: query } },
      ],
    },
    include: {
      feed: { select: { id: true, title: true, url: true, imageUrl: true } },
      userItems: { where: { userId } },
    },
    orderBy: { publishedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return items.map((item) => {
    const userItem = item.userItems[0];
    return {
      id: item.id,
      feedId: item.feedId,
      feed: item.feed,
      title: item.title,
      link: item.link,
      content: item.content,
      summary: item.summary,
      author: item.author,
      publishedAt: item.publishedAt,
      isRead: userItem?.isRead ?? false,
      isStarred: userItem?.isStarred ?? false,
    };
  });
}
