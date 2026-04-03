import { api } from './client';

export interface Feed {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  siteUrl: string | null;
  imageUrl: string | null;
  lastFetchedAt: string | null;
  _count?: { items: number };
}

export interface Subscription {
  id: string;
  userId: string;
  feedId: string;
  title: string | null;
  feed: Feed;
  createdAt: string;
}

export const feedsApi = {
  getSubscriptions: () => api.get<Subscription[]>('/feeds'),
  subscribe: (url: string, title?: string) => api.post<Subscription>('/feeds/subscribe', { url, title }),
  unsubscribe: (subscriptionId: string) => api.delete(`/feeds/${subscriptionId}`),
  refresh: (feedId: string) => api.post(`/feeds/${feedId}/refresh`),
  search: (query: string) => api.get<Feed[]>(`/feeds/search?q=${encodeURIComponent(query)}`),
};
