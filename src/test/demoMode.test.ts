import { describe, expect, it } from 'vitest';
import { getDemoRestrictionMessage } from '../utils/demoMode';

describe('demo mode helpers', () => {
  it('builds actionable restriction messages', () => {
    expect(getDemoRestrictionMessage('Creating products')).toBe(
      'Demo mode: Creating products is disabled. Upgrade to manage your real data.'
    );
  });
});
