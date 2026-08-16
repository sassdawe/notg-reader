import { api } from './client';

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  createdAt: string;
}

export const authApi = {
  registerStart: (username: string) =>
    api.post<{ options: PublicKeyCredentialCreationOptionsJSON; userId: string }>('/auth/register/start', { username }),
  
  registerFinish: (userId: string, response: unknown) =>
    api.post<{ verified: boolean }>('/auth/register/finish', { userId, response }),
  
  loginStart: (username: string) =>
    api.post<{ options: PublicKeyCredentialRequestOptionsJSON; userId: string }>('/auth/login/start', { username }),
  
  loginFinish: (userId: string, response: unknown) =>
    api.post<{ verified: boolean }>('/auth/login/finish', { userId, response }),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get<User>('/auth/me'),

  updateProfile: (data: { displayName?: string; email?: string }) =>
    api.put<User>('/auth/profile', data),
};
