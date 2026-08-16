import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    loading: false,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('should render login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('notg-reader')).toBeInTheDocument();
    expect(screen.getByText('Sign in with your passkey')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should have link to register page', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Register')).toHaveAttribute('href', '/register');
  });
});
