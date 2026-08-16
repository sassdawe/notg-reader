import { useState, useEffect, useCallback } from 'react';
import { itemsApi, type FeedItem } from '../api/items';
import { ItemList } from '../components/ItemList';
import { useSettings } from '../contexts/SettingsContext';
import styles from './HomePage.module.css';

export function StarredPage() {
  const { settings } = useSettings();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const viewMode = settings?.viewMode || 'list';

  useEffect(() => {
    itemsApi.getItems({ isStarred: true })
      .then((result) => setItems(result.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return <div className={styles.loading}>Loading starred items...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>⭐ Starred Items</h2>
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
