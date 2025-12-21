import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import DashboardPage from '../DashboardPage';

vi.mock('../../services/sessionService', () => ({
  default: { getUserSessions: vi.fn().mockResolvedValue({ data: [] }) }
}));

vi.mock('../../services/chatService', () => ({
  default: { getConversations: vi.fn().mockResolvedValue([]) }
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { profile: { firstName: 'A' }, _id: 'U1' } }),
}));

describe('DashboardPage snapshot', () => {
  it('matches DOM snapshot', async () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
