import { type FeedItem } from '../api/items';
import { ItemCard } from './ItemCard';
import styles from './ItemList.module.css';

interface ItemListProps {
  items: FeedItem[];
  viewMode: 'list' | 'expanded';
  onMarkRead: (id: string) => void;
  onToggleStar: (id: string) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function ItemList({ items, viewMode, onMarkRead, onToggleStar, selectedId, onSelect }: ItemListProps) {
  if (items.length === 0) {
    return <div className={styles.empty}>No items to show</div>;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          viewMode={viewMode}
          onMarkRead={onMarkRead}
          onToggleStar={onToggleStar}
          isSelected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
