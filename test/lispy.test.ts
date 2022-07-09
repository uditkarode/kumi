import {
  combinatorWithin,
  firstIn,
  many,
  oneIn,
  oneOf,
  spaces,
  stringl,
  until,
  within,
} from "../src/combinators";
import { ParseError } from "../src/parse-error";
import { Parser } from "../src/parser";
import { Combinator } from "../src/types";

const son = Parser.combinator((ca) => {
  many(oneOf(stringl("\n"), stringl(" ")))(ca);
});

it("should be able to parse a simple lispy structure", () => {
  type Content = string | [string] | [string, Content];

  const inner: Combinator<Content> = (ca) => {
    const funName = firstIn([until(" "), until(")"), until("\n")])(ca);

    // hack to peek atm
    if (ca.target[ca.cursor.get()] == ")") {
      return [funName];
    }

    son(ca);

    const string = Parser.combinator((ca) => {
      return Parser.expect(within('"', '"')(ca));
    });

    return [funName, oneIn<Content>(fun, string)(ca)];
  };

  const fun = Parser.combinator((ca) => {
    const content = combinatorWithin("(", inner, ")")(ca);
    son(ca);
    return content;
  });

  const lispy = Parser.combinator((ca) => {
    son(ca);
    return many(fun, false)(ca);
  });

  // parser runner code
  const parser = new Parser();
  const result = parser.parse(
    `(html\n(h1 "hello"))\n(p "what's up")\n(hi)`,
    lispy
  );

  if (result instanceof ParseError) {
    console.log(Parser.format(result));
    throw result;
  } else {
    console.log(parser.target);
    console.log(result);
  }
});
