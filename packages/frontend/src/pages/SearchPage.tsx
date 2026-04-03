import { useState, useCallback } from 'react';
import { itemsApi, type FeedItem } from '../api/items';
import { ItemList } from '../components/ItemList';
import { useSettings } from '../contexts/SettingsContext';
import styles from './HomePage.module.css';
import searchStyles from './SearchPage.module.css';

export function SearchPage() {
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const viewMode = settings?.viewMode || 'list';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await itemsApi.search(query.trim());
      setItems(results);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>🔍 Search</h2>
      </div>

      <form onSubmit={handleSearch} className={searchStyles.searchForm}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all feeds..."
          className={searchStyles.searchInput}
          autoFocus
        />
        <button type="submit" disabled={loading} className={searchStyles.searchButton}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && (
        <ItemList
          items={items}
          viewMode={viewMode}
          onMarkRead={handleMarkRead}
          onToggleStar={handleToggleStar}
        />
      )}
    </div>
  );
}
