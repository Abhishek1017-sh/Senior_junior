import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '../ProfilePage';
import userService from '../../services/userService';

vi.mock('../../services/userService', () => ({ getUserProfile: vi.fn() }));

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

    render(<ProfilePage />);

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

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.queryByText(/\(Private\)/i)).not.toBeInTheDocument();
    });
  });
});
