import { describe, expect, it } from 'vitest';
import { isRunningStandalone } from './install';

describe('isRunningStandalone', () => {
  it('is false in a normal browser tab', () => {
    expect(isRunningStandalone()).toBe(false);
  });

  it('is true when the display mode is standalone', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('standalone'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    expect(isRunningStandalone()).toBe(true);

    window.matchMedia = original;
  });
});
