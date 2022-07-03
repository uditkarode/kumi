import { ParseError } from "./parse-error";
import { Backtrack } from "./utils";

export type ParseFn = <T extends Backtrack>(
  v: string,
  b?: T
) => T extends Backtrack.Never ? string : ParseError | string;

export type CombinatorArg = {
  consume: ParseFn;
  error: (v: { expected: string; found: string }) => ParseError;
  expect: <T>(c: Combinator<T>) => SureCombinator<T>;
  cursor: {
    get: () => number;
    set: (pos: number) => void;
  };
};

export type ParserCombinatorFn = <T, B extends boolean>(
  v: Combinator<T>,
  sure?: B
) => B extends true ? SureCombinator<T> : Combinator<T>;

export type Combinator<T> = (ca: CombinatorArg) => T | ParseError;

export type SureCombinator<T> = (ca: CombinatorArg) => T;
