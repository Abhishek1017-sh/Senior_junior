import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { within } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'Alice' }, isAuthenticated: true, logout: vi.fn() })
}));

vi.mock('../../../src/context/ChatContext', () => ({
  useChat: () => ({ totalUnreadCount: 0 })
}));

vi.mock('../../../src/context/NotificationContext', () => ({
  useNotifications: () => ({ pendingConnectionsCount: 0, pendingSessionsCount: 0 })
}));

import Navbar from '../Navbar';

describe('Navbar', () => {
  afterEach(() => vi.clearAllMocks());

  it('toggles mobile menu open and closed', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /open menu/i });
    expect(button).toBeInTheDocument();

    // open
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // check the mobile menu scoped content
    const mobile = screen.getByTestId('mobile-menu');
    const mobileScope = within(mobile);
    expect(mobileScope.getByText(/Dashboard/i)).toBeVisible();

    // close
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
