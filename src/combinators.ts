import { ParseError } from "./parse-error.ts";
import { Parser } from "./parser.ts";
import { Combinator } from "./types.ts";
import { Backtrack, Try } from "./utils.ts";

export const stringl = (v: string) =>
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
      if (i != lastIndex) many(stringl(" "))(ca);
    });

    return results;
  });

export const many = <T>(c: Combinator<T>, zeroAllowed = true) =>
  Parser.combinator((ca) => {
    const items: T[] = [];

    if (!zeroAllowed) items.push(c(ca));

    while (true) {
      const result = Try(c)(ca);
      if (result instanceof ParseError) break;
      else items.push(result);
    }

    return items;
  });

export const combinatorWithin = <T>(
  str1: string,
  combinator: Combinator<T>,
  str2: string
) =>
  Parser.combinator((ca) => {
    ca.consume(str1);
    const r = combinator(ca);
    ca.consume(str2);
    return r;
  });

export const within = (str1: string, str2: string) =>
  Parser.combinator((ca) => {
    ca.consume(str1);
    const r = ca.consume(str2, Backtrack.IfEncountered);
    ca.consume(str2);
    return r;
  });

export const spaces = many(stringl(" "), false);

export const until = (target: string) =>
  Parser.combinator((ca) => {
    return Parser.expect(ca.consume(target, Backtrack.IfEncountered));
  });

export const oneIn = <T>(...combinators: Combinator<T>[]) =>
  Parser.combinator((ca) => {
    for (const c of combinators) {
      const result = Try(c)(ca);
      if (!(result instanceof ParseError)) return result;
    }

    throw ca.error({
      expected: "one of the oneIn combinators to match",
      found: "no matches",
    });
  });

export const oneOf = <T, U>(x: Combinator<T>, y: Combinator<U>) =>
  Parser.combinator((ca) => {
    const xResult = Try(x)(ca);

    if (xResult instanceof ParseError) {
      const yResult = Try(y)(ca);
      if (yResult instanceof ParseError) {
        throw yResult;
      } else return yResult;
    } else return xResult;
  });

export const firstIn = (combinators: Combinator<string>[]) =>
  Parser.combinator((ca) => {
    const start = ca.cursor.get();
    const results = [] as { value: string; index: number }[];

    for (const combinator of combinators) {
      ca.cursor.set(start);
      const result = Try(combinator)(ca);

      if (!(result instanceof ParseError)) {
        results.push({ value: result, index: ca.cursor.get() });
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
      ca.cursor.set(result.index);
      return result.value;
    }
  });
