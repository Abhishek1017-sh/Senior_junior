import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import sessionService from '../../services/sessionService';

vi.mock('../../services/sessionService', () => ({
  getUserSessions: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { profile: { firstName: 'TestUser' }, _id: 'USER_ID' } }),
}));

describe('DashboardPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders upcoming confirmed sessions (future only)', async () => {
    // Prepare now and future/past dates
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    sessionService.getUserSessions.mockResolvedValue({
      data: [
        { _id: 's1', topic: 'Future Confirmed', scheduledTime: future, status: 'confirmed', senior: { profile: { firstName: 'Sen' } } },
        { _id: 's2', topic: 'Past Confirmed', scheduledTime: past, status: 'confirmed', senior: { profile: { firstName: 'Sen' } } },
        { _id: 's3', topic: 'Future Pending', scheduledTime: future, status: 'pending', senior: { profile: { firstName: 'Sen' } } },
      ]
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // The future confirmed session should appear
      expect(screen.getByText('Future Confirmed')).toBeInTheDocument();
      // The past confirmed session should NOT appear in the upcoming list
      expect(screen.queryByText('Past Confirmed')).not.toBeInTheDocument();
      // The pending future session should not be shown in the Upcoming list (only confirmed)
      expect(screen.queryByText('Future Pending')).not.toBeInTheDocument();
    });
  });
});
