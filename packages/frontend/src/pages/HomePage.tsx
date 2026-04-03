import { useState, useEffect, useCallback } from 'react';
import { itemsApi, type FeedItem } from '../api/items';
import { ItemList } from '../components/ItemList';
import { useSettings } from '../contexts/SettingsContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { cacheItems } from '../utils/offlineStorage';
import styles from './HomePage.module.css';

export function HomePage() {
  const { settings, updateSettings } = useSettings();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'date' | 'relevance'>('date');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const viewMode = settings?.viewMode || 'list';

  const fetchItems = useCallback(async () => {
    try {
      const result = await itemsApi.getItems({ sort, isRead: false });
      setItems(result.items);
      // Cache for offline access
      cacheItems(result.items).catch(console.error);
    } catch {
      // Could fall back to offline cache
    } finally {
      setLoading(false);
    }
  }, [sort]);

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

  useKeyboardShortcuts({
    'j': () => setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1)),
    'k': () => setSelectedIndex((prev) => Math.max(prev - 1, 0)),
    'm': () => {
      if (items[selectedIndex]) handleMarkRead(items[selectedIndex].id);
    },
    't': () => {
      if (items[selectedIndex]) handleToggleStar(items[selectedIndex].id);
    },
    'v': () => {
      updateSettings({ viewMode: viewMode === 'list' ? 'expanded' : 'list' });
    },
    'r': () => fetchItems(),
  });

  if (loading) {
    return <div className={styles.loading}>Loading items...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>All Items</h2>
        <div className={styles.controls}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'date' | 'relevance')}
            className={styles.select}
            aria-label="Sort order"
          >
            <option value="date">By Date</option>
            <option value="relevance">By Relevance</option>
          </select>
          <button
            onClick={() => updateSettings({ viewMode: viewMode === 'list' ? 'expanded' : 'list' })}
            className={styles.viewToggle}
            aria-label="Toggle view mode"
          >
            {viewMode === 'list' ? '☰' : '▤'}
          </button>
          <button onClick={fetchItems} className={styles.refreshButton} aria-label="Refresh">
            🔄
          </button>
        </div>
      </div>

      <ItemList
        items={items}
        viewMode={viewMode}
        onMarkRead={handleMarkRead}
        onToggleStar={handleToggleStar}
        selectedId={items[selectedIndex]?.id}
        onSelect={(id) => {
          const idx = items.findIndex((item) => item.id === id);
          if (idx >= 0) setSelectedIndex(idx);
        }}
      />
    </div>
  );
}
