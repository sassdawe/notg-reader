import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { feedsApi, type Subscription } from '../api/feeds';
import { useAuth } from '../contexts/AuthContext';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    feedsApi.getSubscriptions().then(setSubscriptions).catch(console.error);
  }, []);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const sub = await feedsApi.subscribe(feedUrl.trim());
      setSubscriptions((prev) => [...prev, sub]);
      setFeedUrl('');
      setShowAddFeed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionId: string) => {
    try {
      await feedsApi.unsubscribe(subscriptionId);
      setSubscriptions((prev) => prev.filter((s) => s.id !== subscriptionId));
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.logo}>notg-reader</h1>
        <span className={styles.username}>{user?.username}</span>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} end>
          📰 All Items
        </NavLink>
        <NavLink to="/starred" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          ⭐ Starred
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          🔍 Search
        </NavLink>
      </nav>

      <div className={styles.feeds}>
        <div className={styles.feedsHeader}>
          <h2 className={styles.feedsTitle}>Feeds</h2>
          <button className={styles.addButton} onClick={() => setShowAddFeed(!showAddFeed)} aria-label="Add feed">
            +
          </button>
        </div>

        {showAddFeed && (
          <form onSubmit={handleAddFeed} className={styles.addForm}>
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="Feed URL..."
              className={styles.input}
              required
              autoFocus
            />
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? '...' : 'Add'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        )}

        <ul className={styles.feedList}>
          {subscriptions.map((sub) => (
            <li key={sub.id} className={styles.feedItem}>
              <NavLink
                to={`/feed/${sub.feedId}`}
                className={({ isActive }) => `${styles.feedLink} ${isActive ? styles.active : ''}`}
              >
                {sub.feed.imageUrl && <img src={sub.feed.imageUrl} alt="" className={styles.feedIcon} />}
                <span className={styles.feedName}>{sub.title || sub.feed.title || 'Untitled'}</span>
                {sub.feed._count?.items !== undefined && (
                  <span className={styles.count}>{sub.feed._count.items}</span>
                )}
              </NavLink>
              <button
                className={styles.removeButton}
                onClick={() => handleUnsubscribe(sub.id)}
                aria-label={`Unsubscribe from ${sub.title || sub.feed.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <NavLink to="/settings" className={styles.navItem}>
          ⚙️ Settings
        </NavLink>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </aside>
  );
}
