import { api } from './client';

export interface Label {
  id: string;
  name: string;
  color: string | null;
  userId: string;
  createdAt: string;
}

export const labelsApi = {
  getLabels: () => api.get<Label[]>('/labels'),
  createLabel: (name: string, color?: string) => api.post<Label>('/labels', { name, color }),
  deleteLabel: (labelId: string) => api.delete(`/labels/${labelId}`),
  assignLabel: (feedItemId: string, labelId: string) => api.post('/labels/assign', { feedItemId, labelId }),
  unassignLabel: (feedItemId: string, labelId: string) => api.post('/labels/unassign', { feedItemId, labelId }),
};
