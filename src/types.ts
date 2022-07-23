import { ParseError } from "./parse-error.ts";
import { Backtrack } from "./parser.ts";

export type ConsumeFn = <T extends Backtrack>(
  v: string,
  b?: T
) => Backtrack.Never extends T ? string : ParseError | string;

export type CombinatorArg = {
  target: string;
  consume: ConsumeFn;
  error: (v: { expected: string; found: string }) => ParseError;
  cursor: {
    get: () => number;
    set: (pos: number) => void;
  };
};

export type Combinator<T> = (ca: CombinatorArg) => T;
