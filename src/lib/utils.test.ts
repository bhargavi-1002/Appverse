import { describe, expect, it } from 'vitest';
import { formatBytes, formatDate, isSafeExternalUrl, safeUrl, slugify, truncate } from './utils';

describe('isSafeExternalUrl', () => {
  it('accepts https and http URLs', () => {
    expect(isSafeExternalUrl('https://example.com')).toBe(true);
    expect(isSafeExternalUrl('http://example.com/path?x=1')).toBe(true);
  });

  it('rejects dangerous schemes', () => {
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isSafeExternalUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeExternalUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects relative paths and empty values', () => {
    expect(isSafeExternalUrl('/apps/cyber-runner')).toBe(false);
    expect(isSafeExternalUrl('')).toBe(false);
    expect(isSafeExternalUrl(undefined)).toBe(false);
    expect(isSafeExternalUrl(null)).toBe(false);
  });

  it('rejects protocol-relative URLs', () => {
    expect(isSafeExternalUrl('//evil.example.com')).toBe(false);
  });
});

describe('safeUrl', () => {
  it('returns the value only when it is safe', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com');
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
  });
});

describe('formatDate', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2026-06-05')).toMatch(/2026/);
  });

  it('falls back for missing or invalid values', () => {
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('truncate', () => {
  it('leaves short strings alone', () => {
    expect(truncate('short', 20)).toBe('short');
  });

  it('cuts long strings on a word boundary', () => {
    const result = truncate('the quick brown fox jumps over the lazy dog', 20);
    expect(result.length).toBeLessThanOrEqual(21);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('formatBytes', () => {
  it('formats byte counts', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('handles invalid input', () => {
    expect(formatBytes(0)).toBe('—');
    expect(formatBytes(Number.NaN)).toBe('—');
  });
});

describe('slugify', () => {
  it('produces url-safe slugs', () => {
    expect(slugify('Neon Snake Pro!')).toBe('neon-snake-pro');
    expect(slugify('  Cyber  Runner  ')).toBe('cyber-runner');
  });
});
