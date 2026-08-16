import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { itemsApi, type FeedItem } from '../api/items';
import { feedsApi } from '../api/feeds';
import { ItemList } from '../components/ItemList';
import { useSettings } from '../contexts/SettingsContext';
import { copyToClipboard } from '../utils/clipboard';
import styles from './HomePage.module.css';

export function FeedPage() {
  const { feedId } = useParams<{ feedId: string }>();
  const { settings, updateSettings } = useSettings();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedTitle, setFeedTitle] = useState('');

  const viewMode = settings?.viewMode || 'list';

  const fetchItems = useCallback(async () => {
    if (!feedId) return;
    setLoading(true);
    try {
      const result = await itemsApi.getItems({ feedId });
      setItems(result.items);
      if (result.items.length > 0 && result.items[0].feed) {
        setFeedTitle(result.items[0].feed.title || 'Feed');
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [feedId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleMarkRead = useCallback(async (id: string) => {
    await itemsApi.markSingleRead(id);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
  }, []);

  const handleToggleStar = useCallback(async (id: string) => {
    const result = await itemsApi.toggleStar(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isStarred: result.isStarred } : item)),
    );
  }, []);

  const handleRefresh = async () => {
    if (!feedId) return;
    await feedsApi.refresh(feedId);
    fetchItems();
  };

  const handleShareFeed = async () => {
    const feed = items[0]?.feed;
    if (feed?.url) {
      await copyToClipboard(feed.url);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading feed...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>{feedTitle}</h2>
        <div className={styles.controls}>
          <button onClick={handleShareFeed} className={styles.viewToggle} aria-label="Share feed URL">
            📋
          </button>
          <button
            onClick={() => updateSettings({ viewMode: viewMode === 'list' ? 'expanded' : 'list' })}
            className={styles.viewToggle}
            aria-label="Toggle view mode"
          >
            {viewMode === 'list' ? '☰' : '▤'}
          </button>
          <button onClick={handleRefresh} className={styles.refreshButton} aria-label="Refresh feed">
            🔄
          </button>
        </div>
      </div>

      <ItemList
        items={items}
        viewMode={viewMode}
        onMarkRead={handleMarkRead}
        onToggleStar={handleToggleStar}
      />
    </div>
  );
}
