export interface CodeEditResult {
  code: string;
  selectionStart: number;
  selectionEnd: number;
}

const INDENT = '  ';

export function indentCodeSelection(
  code: string,
  selectionStart: number,
  selectionEnd: number,
  outdent = false
): CodeEditResult {
  if (selectionStart === selectionEnd) {
    if (!outdent) {
      return {
        code: `${code.slice(0, selectionStart)}${INDENT}${code.slice(selectionEnd)}`,
        selectionStart: selectionStart + INDENT.length,
        selectionEnd: selectionStart + INDENT.length,
      };
    }

    const lineStart = code.lastIndexOf('\n', selectionStart - 1) + 1;
    const leadingWhitespace = code.slice(lineStart).match(/^(?: {1,2}|\t)/)?.[0] ?? '';
    if (!leadingWhitespace) {
      return { code, selectionStart, selectionEnd };
    }

    const nextCode = `${code.slice(0, lineStart)}${code.slice(lineStart + leadingWhitespace.length)}`;
    const nextPosition = Math.max(lineStart, selectionStart - leadingWhitespace.length);
    return { code: nextCode, selectionStart: nextPosition, selectionEnd: nextPosition };
  }

  const firstLineStart = code.lastIndexOf('\n', selectionStart - 1) + 1;
  const endProbe = selectionEnd > selectionStart && code[selectionEnd - 1] === '\n'
    ? selectionEnd - 2
    : selectionEnd - 1;
  const lastLineStart = code.lastIndexOf('\n', endProbe) + 1;
  const edits: Array<{ position: number; delta: number; removed: string }> = [];

  for (let lineStart = firstLineStart; lineStart <= lastLineStart;) {
    if (outdent) {
      const leadingWhitespace = code.slice(lineStart).match(/^(?: {1,2}|\t)/)?.[0] ?? '';
      if (leadingWhitespace) {
        edits.push({ position: lineStart, delta: -leadingWhitespace.length, removed: leadingWhitespace });
      }
    } else {
      edits.push({ position: lineStart, delta: INDENT.length, removed: '' });
    }

    const nextLineBreak = code.indexOf('\n', lineStart);
    if (nextLineBreak < 0) break;
    lineStart = nextLineBreak + 1;
  }

  let nextCode = code;
  for (const edit of [...edits].reverse()) {
    nextCode = `${nextCode.slice(0, edit.position)}${outdent ? '' : INDENT}${nextCode.slice(edit.position + edit.removed.length)}`;
  }

  const adjustPosition = (position: number) => Math.max(
    0,
    position + edits.reduce((adjustment, edit) => adjustment + (edit.position <= position ? edit.delta : 0), 0)
  );

  return {
    code: nextCode,
    selectionStart: adjustPosition(selectionStart),
    selectionEnd: adjustPosition(selectionEnd),
  };
}
