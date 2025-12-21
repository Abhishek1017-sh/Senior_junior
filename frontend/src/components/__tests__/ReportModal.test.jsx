import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportModal from '../ReportModal';

describe('ReportModal', () => {
  it('renders and calls onSubmit with reason and description', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue({ success: true });
    const reportedUser = { profile: { firstName: 'Alice' }, username: 'alice' };

    render(<ReportModal isOpen onClose={onClose} onSubmit={onSubmit} reportedUser={reportedUser} />);

    expect(screen.getByText('Report Alice')).toBeInTheDocument();

    // Change reason
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Spam' } });

    // Type description
    const textarea = screen.getByPlaceholderText('Describe what happened (optional)');
    fireEvent.change(textarea, { target: { value: 'This is spam' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit Report/i });
    fireEvent.click(submitButton);

    // onSubmit should be called with reason and description
    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({ reason: 'Spam', description: 'This is spam' });
    });
  });
});
