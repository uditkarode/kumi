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

export const array = (from: number, to: number) => {
  return [...Array(to).keys()].map((v) => v + from);
};

export const lined = (...strings: string[]) => strings.join("\n");
