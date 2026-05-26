import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

const mockLogout = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    logout: mockLogout,
  }),
}));

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle</button>,
}));

describe('Navbar', () => {
  it('renders navigation links for authenticated user', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('History')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Calmobot')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Profile')[0]).toBeInTheDocument();
  });

  it('calls logout when logout button clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    fireEvent.click(screen.getAllByText('Logout')[0]);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('has accessible mobile menu toggle', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const toggle = screen.getByLabelText('Toggle navigation menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('type', 'button');
  });
});
