import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditProfilePage from '../EditProfilePage';
import * as AuthContext from '../../context/AuthContext';
import userService from '../../services/userService';
import authService from '../../services/authService';

vi.mock('../../services/userService', () => ({ uploadProfilePicture: vi.fn(), deleteProfilePicture: vi.fn() }));
vi.mock('../../services/authService', () => ({ updateProfile: vi.fn(), getCurrentUser: vi.fn() }));

describe('EditProfilePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: { _id: 'USER123', profile: { firstName: 'Test', profilePictureUrl: '' } },
      refetchUser: vi.fn(),
    }));
  });

  it('submits profile update without picture', async () => {
    authService.updateProfile.mockResolvedValue({ data: { message: 'Profile updated', data: {} } });

    render(<EditProfilePage />);
    const firstName = screen.getByLabelText(/First Name/i);
    fireEvent.change(firstName, { target: { value: 'NewFirst' } });

    const saveBtn = screen.getByText(/Save Changes/i);
    fireEvent.click(saveBtn);

    await waitFor(() => expect(authService.updateProfile).toHaveBeenCalled());
  });

  it('uploads profile picture and calls refetch', async () => {
    const mockFile = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' });
    userService.uploadProfilePicture.mockResolvedValue({ data: { profilePictureUrl: 'http://localhost:5000/uploads/avatar.png' } });

    const refetchSpy = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: { _id: 'USER123', profile: { firstName: 'Test', profilePictureUrl: '' } },
      refetchUser: refetchSpy,
    }));

    render(<EditProfilePage />);

    // set file on input
    const fileInput = screen.getByLabelText(/Change Picture/i).parentNode.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', { value: [mockFile] });
    fireEvent.change(fileInput);

    const saveBtn = screen.getByText(/Save Changes/i);
    fireEvent.click(saveBtn);

    await waitFor(() => expect(userService.uploadProfilePicture).toHaveBeenCalled());
    await waitFor(() => expect(refetchSpy).toHaveBeenCalled());
  });

  it('removes profile picture when clicking remove', async () => {
    userService.deleteProfilePicture.mockResolvedValue({ success: true });
    const refetchSpy = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: { _id: 'USER123', profile: { firstName: 'Test', profilePictureUrl: 'http://localhost:5000/uploads/avatar.png' } },
      refetchUser: refetchSpy,
    }));

    render(<EditProfilePage />);

    const removeBtn = screen.getByText('Remove Picture');
    fireEvent.click(removeBtn);

    await waitFor(() => expect(userService.deleteProfilePicture).toHaveBeenCalled());
    await waitFor(() => expect(refetchSpy).toHaveBeenCalled());
  });

  it('saves structured availability for senior users', async () => {
    authService.updateProfile.mockResolvedValue({ data: {} });
    const refetchSpy = vi.fn();
    // user is a senior for this test
    vi.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: { _id: 'USER123', role: 'senior', profile: { firstName: 'Test' } },
      refetchUser: refetchSpy,
    }));

    render(<EditProfilePage />);

    // Toggle a preset
    const weekdayBtn = screen.getByRole('button', { name: /Weekdays/i });
    fireEvent.click(weekdayBtn);

    // Add custom availability: Mon-Fri 09:00-17:00
    const monCheckbox = screen.getByLabelText('Mon');
    const tueCheckbox = screen.getByLabelText('Tue');
    fireEvent.click(monCheckbox);
    fireEvent.click(tueCheckbox);
    const startInput = screen.getByPlaceholderText(/start/i) || screen.getAllByRole('textbox')[0];

    // Set times (fallback to setting value via querySelector)
    const timeInputs = document.querySelectorAll('input[type=time]');
    if (timeInputs && timeInputs.length >= 2) {
      fireEvent.change(timeInputs[0], { target: { value: '09:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '17:00' } });
    }

    const addBtn = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addBtn);

    // Save changes
    const saveBtn = screen.getByText(/Save Changes/i);
    fireEvent.click(saveBtn);

    await waitFor(() => expect(authService.updateProfile).toHaveBeenCalled());
    const payload = authService.updateProfile.mock.calls[0][0];
    expect(payload.seniorProfile).toBeTruthy();
    expect(Array.isArray(payload.seniorProfile.availability)).toBe(true);
  });
});
