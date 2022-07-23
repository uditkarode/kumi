import { InternalParserError, ParseError } from "./parse-error.ts";
import { Combinator, ConsumeFn } from "./types.ts";
import { array, Backtrack, lined } from "./utils.ts";

export class Parser {
  #cursorPosition = 0;
  target: string | undefined = undefined;

  get cursorPosition() {
    return this.#cursorPosition;
  }

  static combinator = <T>(v: Combinator<T>) => v;

  static expect = <T>(v: T) => {
    if (v instanceof ParseError) throw v;
    else return v as Exclude<T, ParseError>;
  };

  static format = (v: ParseError) => {
    const maxOffset = 10;
    const currentChar = (pos: number) => v.target[pos];

    // func to obtain pre and post
    // we keep going till we get a newline or hit offset
    const get = (
      indexProgressor: (v: number) => number,
      transformer: (v: string[]) => string
    ) => {
      const ret = [];
      let progressions = 0;

      let pos = v.position;
      while (true) {
        // string ended
        if (pos < 0) break;
        if (currentChar(pos) == "\x00") break;
        if (currentChar(pos) == undefined) break;
        // line ended
        if (currentChar(pos) == "\n") break;
        // offset hit
        if (progressions == maxOffset) {
          ret.push("...");
          break;
        }

        pos = indexProgressor(pos);
        ret.push(currentChar(pos));
        progressions++;
      }

      return transformer(ret);
    };

    const pre = get(
      (v) => --v,
      (ret) => ret.reverse().join("")
    );
    const post = get(
      (v) => ++v,
      (ret) => ret.join("")
    );

    return lined(
      `expected: ${v.expected}`,
      `found: ${v.found}`,
      "",
      `${pre}${currentChar(v.position)}${post}`,
      // pointer
      `${array(0, pre.length)
        .map(() => " ")
        .join("")}^`
    );
  };

  #consume = ((v: string, b: Backtrack = Backtrack.Never) => {
    if (this.target == undefined)
      throw new InternalParserError("Attempting to parse non-existent string");

    if (b == Backtrack.IfEncountered && v.length !== 1)
      throw new InternalParserError(
        "Can only use string of length 1 with IfEncountered backtracking"
      );

    const start = this.cursorPosition;

    if (b == Backtrack.IfEncountered) {
      while (true) {
        const current = this.target[this.cursorPosition];

        if (current == v)
          return this.target.substring(start, this.cursorPosition);
        else if (current == undefined)
          throw new ParseError(
            this.target,
            this.cursorPosition,
            `IfEncountered couldn't reach the desired symbol '${v}'!`,
            "\0"
          );

        this.#cursorPosition++;
      }
    } else {
      for (const char of v)
        if (this.target[this.cursorPosition] !== char) {
          // cursor position on target is not the same as required char
          const err = new ParseError(
            this.target,
            this.cursorPosition,
            char,
            this.target[this.cursorPosition]
          );

          if (b == Backtrack.Never) throw err;
          else return err;
        } else this.#cursorPosition++;
    }

    return v;
  }) as ConsumeFn;

  parse<T>(v: string, c: Combinator<T>) {
    this.target = `${v}\x00`;
    this.#cursorPosition = 0;

    try {
      return c({
        target: this.target,
        consume: this.#consume,
        cursor: {
          get: () => this.#cursorPosition,
          set: (pos: number) => (this.#cursorPosition = pos),
        },
        error: ({ expected, found }) =>
          new ParseError(this.target!, this.#cursorPosition, expected, found),
      });
    } catch (e) {
      if (e instanceof ParseError) return e;
      else throw e;
    }
  }
}
