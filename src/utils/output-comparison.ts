type ParsedOutput =
  | { kind: 'scalar'; value: string }
  | { kind: 'list'; values: ParsedOutput[] }
  | { kind: 'map'; entries: Array<[ParsedOutput, ParsedOutput]> };

class OutputParser {
  private index = 0;

  constructor(private readonly source: string) {}

  parse(): ParsedOutput | undefined {
    this.skipWhitespace();
    const value = this.parseValue();
    this.skipWhitespace();
    return this.index === this.source.length ? value : undefined;
  }

  private parseValue(): ParsedOutput | undefined {
    this.skipWhitespace();
    const character = this.source[this.index];
    if (character === '[' || character === '{') return this.parseCollection(character);
    if (character === '"' || character === "'") return this.parseQuotedScalar(character);
    return this.parseBareScalar();
  }

  private parseCollection(opening: '[' | '{'): ParsedOutput | undefined {
    const closing = opening === '[' ? ']' : '}';
    this.index++;
    this.skipWhitespace();
    if (this.source[this.index] === closing) {
      this.index++;
      return opening === '{' ? { kind: 'map', entries: [] } : { kind: 'list', values: [] };
    }

    const first = this.parseValue();
    if (!first) return undefined;
    this.skipWhitespace();

    const isMap = opening === '{' && (this.source[this.index] === '=' || this.source[this.index] === ':');
    const values: ParsedOutput[] = [];
    const entries: Array<[ParsedOutput, ParsedOutput]> = [];
    let value = first;

    while (true) {
      if (isMap) {
        const separator = this.source[this.index];
        if (separator !== '=' && separator !== ':') return undefined;
        this.index++;
        const mappedValue = this.parseValue();
        if (!mappedValue) return undefined;
        entries.push([value, mappedValue]);
      } else {
        values.push(value);
      }

      this.skipWhitespace();
      const delimiter = this.source[this.index];
      if (delimiter === closing) {
        this.index++;
        return isMap ? { kind: 'map', entries } : { kind: 'list', values };
      }
      if (delimiter !== ',') return undefined;
      this.index++;
      const nextValue = this.parseValue();
      if (!nextValue) return undefined;
      value = nextValue;
      this.skipWhitespace();
    }
  }

  private parseQuotedScalar(quote: '"' | "'"): ParsedOutput | undefined {
    this.index++;
    let value = '';
    while (this.index < this.source.length) {
      const character = this.source[this.index++];
      if (character === quote) return { kind: 'scalar', value };
      if (character !== '\\') {
        value += character;
        continue;
      }

      const escaped = this.source[this.index++];
      if (escaped === undefined) return undefined;
      const escapes: Record<string, string> = { n: '\n', r: '\r', t: '\t' };
      value += escapes[escaped] ?? escaped;
    }
    return undefined;
  }

  private parseBareScalar(): ParsedOutput | undefined {
    const start = this.index;
    while (this.index < this.source.length && !',]}:='.includes(this.source[this.index])) {
      this.index++;
    }
    const value = this.source.slice(start, this.index).trim();
    return value ? { kind: 'scalar', value } : undefined;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.source[this.index] ?? '')) this.index++;
  }
}

function parseOutput(source: string): ParsedOutput | undefined {
  const trimmed = source.trim();
  if (!trimmed) return { kind: 'scalar', value: '' };

  if (trimmed[0] !== '[' && trimmed[0] !== '{') {
    const quote = trimmed[0];
    if ((quote === '"' || quote === "'") && trimmed[trimmed.length - 1] === quote) {
      return new OutputParser(trimmed).parse();
    }
    return { kind: 'scalar', value: trimmed };
  }

  return new OutputParser(trimmed).parse();
}

function canonicalize(value: ParsedOutput): string {
  if (value.kind === 'scalar') return `s:${JSON.stringify(value.value)}`;
  if (value.kind === 'list') return `l:[${value.values.map(canonicalize).join(',')}]`;
  const entries = value.entries
    .map(([key, mappedValue]) => `${canonicalize(key)}=${canonicalize(mappedValue)}`)
    .sort();
  return `m:{${entries.join(',')}}`;
}

export function outputsMatch(actual: string, expected: string): boolean {
  const parsedActual = parseOutput(actual);
  const parsedExpected = parseOutput(expected);
  return parsedActual !== undefined
    && parsedExpected !== undefined
    && canonicalize(parsedActual) === canonicalize(parsedExpected);
}
