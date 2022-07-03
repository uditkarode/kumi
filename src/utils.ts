import { ParseError } from "./parse-error";
import { Parser } from "./parser";
import { Combinator } from "./types";

export const enum Backtrack {
  Never,
  OnFail,
  IfEncountered,
}

export const Try = <T>(c: Combinator<T>): Combinator<T | ParseError> =>
  Parser.combinator((ca) => {
    const start = ca.cursor.get();
    try {
      return c(ca);
    } catch (e) {
      if (e instanceof ParseError) {
        ca.cursor.set(start);
        return e;
      } else throw e;
    }
  });
