import { Builder } from 'xml2js';
import { parseString } from 'xml2js';
import { getDb } from '../utils/db.js';
import { sanitizeText } from '../utils/sanitize.js';

interface OpmlOutline {
  $: {
    text?: string;
    title?: string;
    type?: string;
    xmlUrl?: string;
    htmlUrl?: string;
  };
  outline?: OpmlOutline[];
}

export async function exportOpml(userId: string): Promise<string> {
  const db = getDb();
  const subscriptions = await db.subscription.findMany({
    where: { userId },
    include: { feed: true },
    orderBy: { createdAt: 'asc' },
  });

  const outlines = subscriptions.map((sub) => ({
    $: {
      text: sub.title || sub.feed.title || 'Untitled',
      title: sub.title || sub.feed.title || 'Untitled',
      type: 'rss',
      xmlUrl: sub.feed.url,
      htmlUrl: sub.feed.siteUrl || '',
    },
  }));

  const builder = new Builder({
    rootName: 'opml',
    xmldec: { version: '1.0', encoding: 'UTF-8' },
  });

  const opml = {
    $: { version: '1.0' },
    head: {
      title: 'notg-reader subscriptions',
      dateCreated: new Date().toUTCString(),
    },
    body: {
      outline: outlines,
    },
  };

  return builder.buildObject(opml);
}

export async function importOpml(userId: string, opmlContent: string): Promise<{ imported: number; errors: string[] }> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    parseString(opmlContent, { explicitArray: false }, async (err, result) => {
      if (err) {
        reject(new Error('Invalid OPML format'));
        return;
      }

      try {
        const outlines = extractOutlines(result?.opml?.body?.outline);
        let imported = 0;
        const errors: string[] = [];

        for (const outline of outlines) {
          const xmlUrl = outline.$?.xmlUrl;
          if (!xmlUrl) continue;

          try {
            // Find or create feed
            let feed = await db.feed.findUnique({ where: { url: xmlUrl } });
            if (!feed) {
              feed = await db.feed.create({
                data: {
                  url: xmlUrl,
                  title: sanitizeText(outline.$?.title || outline.$?.text || 'Untitled'),
                  siteUrl: outline.$?.htmlUrl,
                },
              });
            }

            // Create subscription if not exists
            const existing = await db.subscription.findUnique({
              where: { userId_feedId: { userId, feedId: feed.id } },
            });

            if (!existing) {
              await db.subscription.create({
                data: {
                  userId,
                  feedId: feed.id,
                  title: outline.$?.title || outline.$?.text || undefined,
                },
              });
              imported++;
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            errors.push(`Failed to import ${xmlUrl}: ${msg}`);
          }
        }

        resolve({ imported, errors });
      } catch (e) {
        reject(e);
      }
    });
  });
}

function extractOutlines(outline: OpmlOutline | OpmlOutline[] | undefined): OpmlOutline[] {
  if (!outline) return [];
  
  const outlines: OpmlOutline[] = Array.isArray(outline) ? outline : [outline];
  const result: OpmlOutline[] = [];

  for (const o of outlines) {
    if (o.$?.xmlUrl) {
      result.push(o);
    }
    if (o.outline) {
      result.push(...extractOutlines(o.outline));
    }
  }

  return result;
}
