import { ParseError } from "./parse-error";
import { Backtrack } from "./utils";

export type ParseFn = <T extends Backtrack>(
  v: string,
  b?: T
) => T extends Backtrack.Never ? string : ParseError | string;

export type CombinatorArg = {
  consume: ParseFn;
  getCursorPosition: () => number;
  setCursorPosition: (pos: number) => void;
  error: (v: { expected: string; found: string }) => ParseError;
};

export type Combinator<T> = (ca: CombinatorArg) => T | ParseError;

export type SureCombinator<T> = (ca: CombinatorArg) => T;
