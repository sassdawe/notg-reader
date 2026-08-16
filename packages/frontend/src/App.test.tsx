import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the contexts and pages for isolated testing
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('./contexts/SettingsContext', () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSettings: () => ({
    settings: { viewMode: 'list', offlineRetention: 7, theme: 'light' },
    updateSettings: vi.fn(),
  }),
}));

import { App } from './App';

describe('App', () => {
  it('should redirect to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Sign in with your passkey')).toBeInTheDocument();
  });

  it('should show login page at /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Sign in with your passkey')).toBeInTheDocument();
  });

  it('should show register page at /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });
});
