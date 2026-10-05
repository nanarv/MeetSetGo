import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Participant } from '../types/meeting';
import { GroupHeatmap } from './GroupHeatmap';

const participants: Participant[] = [
  { id: 'a', name: 'Alex', availability: { 'Mon-0900': 'available' } },
  { id: 's', name: 'Sam', availability: { 'Mon-0900': 'available', 'Mon-0915': 'notPreferred' } },
];

describe('GroupHeatmap', () => {
  it('announces how many people can attend each slot', () => {
    render(<GroupHeatmap days={['Mon']} slots={['0900', '0915']} participants={participants} />);
    expect(
      screen.getByRole('gridcell', { name: 'Mon 9:00 AM: 2 of 2 can attend, everyone available' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: 'Mon 9:15 AM: 1 of 2 can attend' })).toBeInTheDocument();
  });

  it('shows who can make a slot when it is focused', () => {
    render(<GroupHeatmap days={['Mon']} slots={['0900', '0915']} participants={participants} />);
    fireEvent.focus(screen.getByRole('gridcell', { name: /Mon 9:15 AM/ }));
    expect(screen.getByText('Mon 9:15 AM – 9:30 AM')).toBeInTheDocument();
    expect(screen.getByText('Sam', { exact: false, selector: 'p' })).toHaveTextContent('Not preferred: Sam');
    expect(screen.getByText(/Can't make it/).closest('p')).toHaveTextContent('Alex');
  });
});
