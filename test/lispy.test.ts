import {
  combinatorWithin,
  firstIn,
  many,
  oneIn,
  oneOf,
  stringl,
  until,
  within,
} from "../src/combinators";
import { ParseError } from "../src/parse-error";
import { Parser } from "../src/parser";
import { Combinator } from "../src/types";
import { inspect } from "util";

const son = Parser.combinator((ca) => {
  many(oneOf(stringl("\n"), oneOf(stringl(" "), stringl("\t"))))(ca);
});

it("should be able to parse a simple lispy structure", () => {
  type Content = string | [string, Content] | Content[];

  const string = Parser.combinator((ca) => {
    return Parser.expect(within('"', '"')(ca));
  });

  const inner: Combinator<Content> = (ca) => {
    // first is the function name
    // like h1 in (h1 "hi")
    const funName = firstIn([until(" "), until(")"), until("\n"), until("\t")])(
      ca
    );

    // hack to peek atm
    // we return early here if the function ends here (i.e. nothing inside)
    // like (h1)
    if (ca.target[ca.cursor.get()] == ")") {
      return [funName];
    }

    // spaces or tabs after the function name
    // (h1 "hi")
    //    ^
    son(ca);

    // either many other functions or just a string can be inside
    return [funName, oneIn<Content>(many(fun, false), string)(ca)];
  };

  const fun = Parser.combinator((ca) => {
    const content = combinatorWithin("(", inner, ")")(ca);
    // whitespace that might be after the content ends
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
    `
(html
  (h1 "hello")
  (p "what's up)
  (list
    (ul (p "hi"))
    (ul (p "bye")))
  (hi))`,
    lispy
  );

  if (result instanceof ParseError) {
    console.log(Parser.format(result));
    throw result;
  } else {
    console.log(parser.target);
    console.log(inspect(result, false, null, true));
  }
});
