export class ParseError extends Error {
  target: string;
  position: number;
  expected: string;
  found: string;

  constructor(
    target: string,
    position: number,
    expected: string,
    found: string,
    message?: string
  ) {
    super(message);
    this.target = target;
    this.position = position;
    this.expected = expected;
    this.found = found;
  }

  get details() {
    return {
      target: this.target,
      position: this.position,
      expected: this.expected,
      found: this.found,
    };
  }
}

// for errors in code unrelated to the target string
export class InternalParserError extends Error {}
