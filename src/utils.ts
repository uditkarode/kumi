import { ParseError } from "./parse-error";
import { Parser } from "./parser";
import { Combinator, ParseFn } from "./types";

export const enum Backtrack {
  Never,
  OnFail,
  IfEncountered,
}

export const extract = <T>(v: ParseError | T): T => {
  if (v instanceof ParseError) throw v;
  else return v;
};

export const Try = <T>(c: Combinator<T>): Combinator<T> =>
  Parser.combinator((ca) => {
    const start = ca.getCursorPosition();
    try {
      return c(ca);
    } catch (e) {
      if (e instanceof ParseError) {
        ca.setCursorPosition(start);
        return e;
      } else throw e;
    }
  });
