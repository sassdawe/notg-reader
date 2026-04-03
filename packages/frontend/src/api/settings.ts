import { api } from './client';

export interface UserSettings {
  id: string;
  userId: string;
  viewMode: 'list' | 'expanded';
  offlineRetention: number;
  theme: 'light' | 'dark';
}

export const settingsApi = {
  getSettings: () => api.get<UserSettings>('/settings'),
  updateSettings: (data: Partial<Pick<UserSettings, 'viewMode' | 'offlineRetention' | 'theme'>>) =>
    api.put<UserSettings>('/settings', data),
};
