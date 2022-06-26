export class ParseError extends Error {
  position: number;
  expected: string;
  found: string;

  constructor(
    position: number,
    expected: string,
    found: string,
    message?: string
  ) {
    super(message);
    this.position = position;
    this.expected = expected;
    this.found = found;
  }

  get details() {
    return {
      position: this.position,
      expected: this.expected,
      found: this.found,
    };
  }
}

export class InternalParserError extends Error {}
