import { describe, expect, it } from 'vitest';
import { outputsMatch } from './output-comparison';

describe('outputsMatch', () => {
  it('accepts quoted expected strings when program output omits display quotes', () => {
    expect(outputsMatch('olleh\n', '"olleh"')).toBe(true);
    expect(outputsMatch('"olleh"', 'olleh')).toBe(true);
  });

  it('ignores collection formatting and string display quotes', () => {
    expect(outputsMatch('["hello world", "olleh"]', '[hello world,olleh]')).toBe(true);
    expect(outputsMatch('{name: [Alice, Bob]}', '{name=[Alice,Bob]}')).toBe(true);
    expect(outputsMatch('{b=2, a=1}', '{a: 1, b: 2}')).toBe(true);
  });

  it('preserves meaningful scalar content and sequence order', () => {
    expect(outputsMatch('hello', 'olleh')).toBe(false);
    expect(outputsMatch('[1, 2, 3]', '[3, 2, 1]')).toBe(false);
    expect(outputsMatch('[1, 2]', '[1, 2, 3]')).toBe(false);
  });
});
