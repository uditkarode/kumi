import { InternalParserError, ParseError } from "./parse-error";
import { Parser } from "./parser";
import { Combinator } from "./types";
import { Backtrack, extract, Try } from "./utils";

export const stringLiteral = (v: string) =>
  Parser.combinator((ca) => {
    ca.consume(v);
    return v;
  });

export const spacesBetween = (combinators: Combinator<unknown>[]) =>
  Parser.combinator((ca) => {
    const results: unknown[] = [];
    const lastIndex = combinators.length - 1;

    combinators.forEach((combinator, i) => {
      results.push(combinator(ca));
      if (i != lastIndex) many(stringLiteral(" "))(ca);
    });

    return results;
  });

export const many = <T>(c: Combinator<T>, zeroAllowed: boolean = true) =>
  Parser.combinator((ca) => {
    const items: T[] = [];

    if (!zeroAllowed) items.push(extract(c(ca)));

    while (true) {
      const result = Try(c)(ca);
      if (result instanceof ParseError) break;
      else items.push(result);
    }

    return items;
  });

export const within = (str1: string, str2: string) =>
  Parser.combinator((ca) => {
    ca.consume(str1);
    return ca.consume(str2, Backtrack.IfEncountered);
  });

export const spaces = many(stringLiteral(" "), false);

export const until = (target: string) =>
  Parser.combinator((ca) => {
    return ca.consume(target, Backtrack.IfEncountered);
  });

export const oneOf = <T, U>(x: Combinator<T>, y: Combinator<U>) =>
  Parser.combinator((parse) => {
    const xResult = Try(x)(parse);

    if (xResult instanceof ParseError) {
      const yResult = Try(y)(parse);
      if (yResult instanceof ParseError) {
        throw yResult;
      } else return yResult;
    } else return xResult;
  });

export const firstIn = (combinators: Combinator<string>[]) =>
  Parser.combinator((ca) => {
    const start = ca.getCursorPosition();
    const results = [] as { value: string; index: number }[];

    for (const combinator of combinators) {
      ca.setCursorPosition(start);
      const result = Try(combinator)(ca);

      if (
        !(result instanceof InternalParserError) &&
        !(result instanceof ParseError)
      ) {
        results.push({ value: result, index: ca.getCursorPosition() });
      }
    }

    if (results.length == 0)
      throw ca.error({
        expected: `one of firstIn combinators to match`,
        found: "no matches",
      });
    else {
      const indexes = results.map((x) => x.index);
      const result = results[indexes.indexOf(Math.min(...indexes))];
      ca.setCursorPosition(result.index);
      return result.value;
    }
  });
