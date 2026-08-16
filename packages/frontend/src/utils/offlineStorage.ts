import { openDB, type IDBPDatabase } from 'idb';
import type { FeedItem } from '../api/items';

const DB_NAME = 'notg-reader-offline';
const DB_VERSION = 1;
const ITEMS_STORE = 'items';
const META_STORE = 'meta';

interface OfflineDB {
  items: {
    key: string;
    value: FeedItem & { cachedAt: number };
    indexes: {
      'by-feed': string;
      'by-date': number;
    };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const itemStore = db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
        itemStore.createIndex('by-feed', 'feedId');
        itemStore.createIndex('by-date', 'cachedAt');
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}

export async function cacheItems(items: FeedItem[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(ITEMS_STORE, 'readwrite');
  const now = Date.now();
  for (const item of items) {
    await tx.store.put({ ...item, cachedAt: now });
  }
  await tx.done;
}

export async function getCachedItems(feedId?: string): Promise<FeedItem[]> {
  const db = await getDb();
  if (feedId) {
    return db.getAllFromIndex(ITEMS_STORE, 'by-feed', feedId);
  }
  return db.getAll(ITEMS_STORE);
}

export async function cleanupOldItems(retentionDays: number): Promise<void> {
  const db = await getDb();
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const tx = db.transaction(ITEMS_STORE, 'readwrite');
  const index = tx.store.index('by-date');
  let cursor = await index.openCursor();
  while (cursor) {
    if (cursor.value.cachedAt < cutoff) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.put(META_STORE, { key, value });
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDb();
  const entry = await db.get(META_STORE, key);
  return entry?.value as T | undefined;
}
