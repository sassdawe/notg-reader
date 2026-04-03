import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn(),
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('RegisterPage', () => {
  it('should render registration form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should have link to login page', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Sign In')).toHaveAttribute('href', '/login');
  });
});
