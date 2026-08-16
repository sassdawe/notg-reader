import { api } from './client';

export const opmlApi = {
  exportOpml: async (): Promise<string> => {
    const response = await fetch('/api/opml/export', {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Export failed');
    return response.text();
  },
  importOpml: (opmlContent: string) =>
    api.post<{ imported: number; errors: string[] }>('/opml/import', { opml: opmlContent }),
};
