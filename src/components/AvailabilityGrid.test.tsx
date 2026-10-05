import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Availability } from '../types/meeting';
import type { Pen } from '../utilities/grid';
import { AvailabilityGrid } from './AvailabilityGrid';

const renderGrid = (availability: Availability = {}, pen: Pen = 'available') => {
  const onCommit = vi.fn();
  render(
    <AvailabilityGrid
      days={['Mon', 'Tue']}
      slots={['0900', '0915']}
      availability={availability}
      pen={pen}
      onCommit={onCommit}
    />,
  );
  return onCommit;
};

describe('AvailabilityGrid', () => {
  it('labels every cell with its day, time and state', () => {
    renderGrid({ 'Tue-0915': 'notPreferred' });
    expect(screen.getAllByRole('gridcell')).toHaveLength(4);
    expect(screen.getByRole('gridcell', { name: 'Mon 9:00 AM, Not available' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: 'Tue 9:15 AM, Not preferred' })).toBeInTheDocument();
  });

  it('paints the focused cell with the current pen on Enter', () => {
    const onCommit = renderGrid({}, 'notPreferred');
    const cell = screen.getByRole('gridcell', { name: 'Mon 9:00 AM, Not available' });
    cell.focus();
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith({ 'Mon-0900': 'notPreferred' });
  });

  it('erases a cell already painted with the current pen', () => {
    const onCommit = renderGrid({ 'Mon-0900': 'available' }, 'available');
    const cell = screen.getByRole('gridcell', { name: 'Mon 9:00 AM, Available' });
    cell.focus();
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onCommit).toHaveBeenCalledWith({});
  });

  it('moves focus with arrow keys and paints the new cell', () => {
    const onCommit = renderGrid();
    const first = screen.getByRole('gridcell', { name: 'Mon 9:00 AM, Not available' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const next = screen.getByRole('gridcell', { name: 'Tue 9:00 AM, Not available' });
    expect(next).toHaveFocus();
    fireEvent.keyDown(next, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith({ 'Tue-0900': 'available' });
  });

  it('keeps a single tab stop', () => {
    renderGrid();
    const tabbable = screen.getAllByRole('gridcell').filter((cell) => cell.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
  });
});
