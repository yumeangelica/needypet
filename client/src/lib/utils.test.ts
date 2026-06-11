import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins class names and resolves Tailwind conflicts', () => {
    expect(cn('inline-flex', false && 'hidden', ['items-center'], { 'px-2': true })).toBe(
      'inline-flex items-center px-2',
    );
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
