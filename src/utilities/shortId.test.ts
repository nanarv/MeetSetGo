import { describe, expect, it } from 'vitest';
import { generateShortId, SHORT_ID_LENGTH } from './shortId';

describe('generateShortId', () => {
  it('produces short alphanumeric ids', () => {
    const id = generateShortId();
    expect(id).toHaveLength(SHORT_ID_LENGTH);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('produces different ids', () => {
    const ids = new Set(Array.from({ length: 100 }, generateShortId));
    expect(ids.size).toBe(100);
  });
});
