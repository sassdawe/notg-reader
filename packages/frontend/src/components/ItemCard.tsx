import { useRef, useCallback } from 'react';
import { type FeedItem } from '../api/items';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { copyToClipboard } from '../utils/clipboard';
import { formatDate } from '../utils/formatDate';
import styles from './ItemCard.module.css';

interface ItemCardProps {
  item: FeedItem;
  viewMode: 'list' | 'expanded';
  onMarkRead: (id: string) => void;
  onToggleStar: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function ItemCard({ item, viewMode, onMarkRead, onToggleStar, isSelected, onSelect }: ItemCardProps) {
  const hasMarkedRead = useRef(false);

  const handleIntersection = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting && !item.isRead && !hasMarkedRead.current && viewMode === 'expanded') {
        hasMarkedRead.current = true;
        onMarkRead(item.id);
      }
    },
    [item.id, item.isRead, onMarkRead, viewMode],
  );

  const observerRef = useIntersectionObserver(handleIntersection);

  const handleShare = async () => {
    if (item.link) {
      await copyToClipboard(item.link);
    }
  };

  return (
    <article
      ref={viewMode === 'expanded' ? observerRef : null}
      className={`${styles.card} ${item.isRead ? styles.read : ''} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect?.(item.id)}
      role="article"
      aria-label={item.title}
      tabIndex={0}
    >
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.feedTitle}>{item.feed?.title || 'Unknown Feed'}</span>
          {item.author && <span className={styles.author}>by {item.author}</span>}
          <time className={styles.date}>{formatDate(item.publishedAt)}</time>
        </div>
        <div className={styles.actions}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar(item.id); }}
            className={`${styles.actionButton} ${item.isStarred ? styles.starred : ''}`}
            aria-label={item.isStarred ? 'Unstar' : 'Star'}
          >
            {item.isStarred ? '★' : '☆'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className={styles.actionButton}
            aria-label="Share"
          >
            📋
          </button>
          {!item.isRead && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkRead(item.id); }}
              className={styles.actionButton}
              aria-label="Mark as read"
            >
              ✓
            </button>
          )}
        </div>
      </div>

      <h3 className={styles.title}>
        {item.link ? (
          <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            {item.title}
          </a>
        ) : (
          item.title
        )}
      </h3>

      {viewMode === 'expanded' && (
        <div className={styles.body}>
          {item.content ? (
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: item.content }} />
          ) : item.summary ? (
            <p className={styles.summary}>{item.summary}</p>
          ) : null}
        </div>
      )}

      {item.labels && item.labels.length > 0 && (
        <div className={styles.labels}>
          {item.labels.map((label) => (
            <span key={label.id} className={styles.label} style={{ backgroundColor: label.color || '#ccc' }}>
              {label.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
