import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemList } from './ItemList';
import type { FeedItem } from '../api/items';

// jsdom doesn't provide IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const mockItems: FeedItem[] = [
  {
    id: '1',
    feedId: 'feed-1',
    feed: { id: 'feed-1', title: 'Test Feed', url: 'https://test.com', imageUrl: null },
    guid: 'guid-1',
    title: 'Test Article 1',
    link: 'https://test.com/1',
    content: '<p>Content 1</p>',
    summary: 'Summary 1',
    author: 'Author 1',
    publishedAt: new Date().toISOString(),
    isRead: false,
    isStarred: false,
    readAt: null,
    labels: [],
    userItemId: null,
  },
  {
    id: '2',
    feedId: 'feed-1',
    feed: { id: 'feed-1', title: 'Test Feed', url: 'https://test.com', imageUrl: null },
    guid: 'guid-2',
    title: 'Test Article 2',
    link: 'https://test.com/2',
    content: null,
    summary: 'Summary 2',
    author: null,
    publishedAt: new Date().toISOString(),
    isRead: true,
    isStarred: true,
    readAt: new Date().toISOString(),
    labels: [{ id: 'label-1', name: 'Tech', color: '#ff0000' }],
    userItemId: 'ui-2',
  },
];

describe('ItemList', () => {
  it('should render items', () => {
    render(
      <ItemList
        items={mockItems}
        viewMode="list"
        onMarkRead={vi.fn()}
        onToggleStar={vi.fn()}
      />,
    );
    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
  });

  it('should show empty message when no items', () => {
    render(
      <ItemList
        items={[]}
        viewMode="list"
        onMarkRead={vi.fn()}
        onToggleStar={vi.fn()}
      />,
    );
    expect(screen.getByText('No items to show')).toBeInTheDocument();
  });

  it('should show labels on items', () => {
    render(
      <ItemList
        items={mockItems}
        viewMode="list"
        onMarkRead={vi.fn()}
        onToggleStar={vi.fn()}
      />,
    );
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  it('should show content in expanded view', () => {
    render(
      <ItemList
        items={mockItems}
        viewMode="expanded"
        onMarkRead={vi.fn()}
        onToggleStar={vi.fn()}
      />,
    );
    expect(screen.getByText('Summary 2')).toBeInTheDocument();
  });
});
