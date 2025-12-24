import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfilePage from '../ProfilePage';
import { MemoryRouter } from 'react-router-dom';
import userService from '../../services/userService';

vi.mock('../../services/userService', () => ({
  default: {
    getUserProfile: vi.fn(),
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ userId: 'USER123' }),
  };
});

import * as AuthContext from '../../context/AuthContext';
vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({ user: { _id: 'OTHER_USER', profile: { firstName: 'Test' } } }));

import { maskEmail } from '../../utils/helpers';

describe('ProfilePage', () => {
  afterEach(() => vi.clearAllMocks());

  it('shows masked email when viewing another user profile', async () => {
    userService.getUserProfile.mockResolvedValue({ data: { _id: 'USER123', email: 'alice@example.com', profile: { firstName: 'Alice' } } });

    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(maskEmail('alice@example.com'))).toBeInTheDocument();
      expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
      expect(screen.getAllByText(/\(Private\)/i).length).toBeGreaterThan(0);
    });
  });

  it('shows full email to owner', async () => {
    // Switch context to simulate owner
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({ user: { _id: 'USER123', profile: { firstName: 'Alice' } } }));

    userService.getUserProfile.mockResolvedValue({ data: { _id: 'USER123', email: 'alice@example.com', profile: { firstName: 'Alice' } } });

    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.queryByText(/\(Private\)/i)).not.toBeInTheDocument();
    });
  });
});
