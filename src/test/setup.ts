import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.classList.remove('light');
});
