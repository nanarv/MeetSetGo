import type { Participant } from '../types/meeting';

export interface CellSummary {
  available: string[];
  notPreferred: string[];
  unavailable: string[];
}

export const HEAT_LEVELS = 5;

export const summarizeCell = (participants: Participant[], key: string): CellSummary => {
  const summary: CellSummary = { available: [], notPreferred: [], unavailable: [] };
  for (const { name, availability } of participants) {
    const state = availability[key];
    if (state === 'available') summary.available.push(name);
    else if (state === 'notPreferred') summary.notPreferred.push(name);
    else summary.unavailable.push(name);
  }
  return summary;
};

/** People who can make the slot at all, preferred or not. */
export const attendeeCount = (summary: CellSummary): number =>
  summary.available.length + summary.notPreferred.length;

export const isEveryoneAvailable = (summary: CellSummary): boolean =>
  summary.available.length > 0 &&
  summary.notPreferred.length === 0 &&
  summary.unavailable.length === 0;

/** 0 (nobody) … HEAT_LEVELS (everyone). */
export const heatLevel = (count: number, total: number): number =>
  total === 0 ? 0 : Math.ceil((count / total) * HEAT_LEVELS);
