import { api } from './client';

export interface FeedItem {
  id: string;
  feedId: string;
  feed: { id: string; title: string | null; url: string; imageUrl: string | null };
  guid: string;
  title: string;
  link: string | null;
  content: string | null;
  summary: string | null;
  author: string | null;
  publishedAt: string | null;
  isRead: boolean;
  isStarred: boolean;
  readAt: string | null;
  labels: Array<{ id: string; name: string; color: string | null }>;
  userItemId: string | null;
}

export interface ItemsResponse {
  items: FeedItem[];
  total: number;
}

export interface ItemsQuery {
  feedId?: string;
  isRead?: boolean;
  isStarred?: boolean;
  labelId?: string;
  sort?: 'date' | 'relevance';
  page?: number;
  limit?: number;
}

export const itemsApi = {
  getItems: (query: ItemsQuery = {}) => {
    const params = new URLSearchParams();
    if (query.feedId) params.set('feedId', query.feedId);
    if (query.isRead !== undefined) params.set('isRead', String(query.isRead));
    if (query.isStarred !== undefined) params.set('isStarred', String(query.isStarred));
    if (query.labelId) params.set('labelId', query.labelId);
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    return api.get<ItemsResponse>(`/items?${params.toString()}`);
  },

  markRead: (feedItemIds: string[]) => api.post('/items/read', { feedItemIds }),
  markSingleRead: (feedItemId: string) => api.post(`/items/${feedItemId}/read`),
  toggleStar: (feedItemId: string) => api.post<{ isStarred: boolean }>(`/items/${feedItemId}/star`),
  search: (query: string, page = 1) => api.get<FeedItem[]>(`/search?q=${encodeURIComponent(query)}&page=${page}`),
};
