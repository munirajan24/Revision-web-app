import { describe, expect, it } from 'vitest';
import { indentCodeSelection } from './code-editor';

describe('indentCodeSelection', () => {
  it('inserts two spaces at the caret', () => {
    expect(indentCodeSelection('ab', 1, 1)).toEqual({
      code: 'a  b',
      selectionStart: 3,
      selectionEnd: 3,
    });
  });

  it('indents each selected line and keeps the selection around the code', () => {
    expect(indentCodeSelection('first\nsecond\nthird', 2, 12)).toEqual({
      code: '  first\n  second\nthird',
      selectionStart: 4,
      selectionEnd: 16,
    });
  });

  it('outdents selected lines by up to two spaces', () => {
    expect(indentCodeSelection('  first\n second\nthird', 0, 16, true)).toEqual({
      code: 'first\nsecond\nthird',
      selectionStart: 0,
      selectionEnd: 13,
    });
  });

  it('outdents the current line when there is no selection', () => {
    expect(indentCodeSelection('  value', 4, 4, true)).toEqual({
      code: 'value',
      selectionStart: 2,
      selectionEnd: 2,
    });
  });
});
