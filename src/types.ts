import { ParseError } from "./parse-error";
import { Backtrack } from "./utils";

export type ConsumeFn = <T extends Backtrack>(
  v: string,
  b?: T
) => Backtrack.Never extends T ? string : ParseError | string;

export type CombinatorArg = {
  consume: ConsumeFn;
  error: (v: { expected: string; found: string }) => ParseError;
  cursor: {
    get: () => number;
    set: (pos: number) => void;
  };
};

export type Combinator<T> = (ca: CombinatorArg) => T;
