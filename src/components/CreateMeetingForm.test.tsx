import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreateMeetingForm } from './CreateMeetingForm';

describe('CreateMeetingForm', () => {
  it('shows a validation error and does not submit without a title', () => {
    const onSubmit = vi.fn();
    render(<CreateMeetingForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Alex' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create meeting' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a meeting title.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values with weekdays selected by default', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateMeetingForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: ' Alex ' } });
    fireEvent.change(screen.getByLabelText('Meeting title'), { target: { value: ' Standup ' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fri' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create meeting' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Alex',
        title: 'Standup',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
        startTime: '09:00',
        endTime: '17:00',
        durationMinutes: 60,
      }),
    );
  });

  it('shows the error when creating fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network down'));
    render(<CreateMeetingForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText('Meeting title'), { target: { value: 'Standup' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create meeting' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Network down');
  });
});
