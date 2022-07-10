import {
  combinatorWithin,
  many,
  oneIn,
  stringl,
  until,
  within,
} from "../src/combinators";
import { ParseError } from "../src/parse-error";
import { Parser } from "../src/parser";
import { Combinator } from "../src/types";
import { inspect } from "util";

const whitespace = Parser.combinator((ca) => {
  return many(oneIn(stringl("\n"), stringl(" "), stringl("\t")))(ca);
});

const peek: Combinator<string> = (ca) => ca.target[ca.cursor.get()];

it("should be able to parse a simple lispy structure", () => {
  type FunContent = [string, FunContent] | string | FunContent[];

  const funContent: Combinator<FunContent> = (ca) => {
    // like h1 in (h1 "hi")
    const funName = oneIn(until(" "), until(")"), until("\n"), until("\t"))(ca);

    // we return early here if the function ends here (i.e. nothing inside)
    // like (h1)
    if (peek(ca) == ")") return [funName];

    // whitespace after the function name
    // (h1 "hi")
    //    ^
    whitespace(ca);

    const word: Combinator<string> = (ca) =>
      // Parser.expect throws on failure
      Parser.expect(within('"', '"')(ca));

    // either many other functions or just a string can be inside
    return [funName, oneIn<FunContent>(many(fun, false), word)(ca)];
  };

  const fun = Parser.combinator((ca) => {
    const r = combinatorWithin("(", funContent, ")")(ca);
    whitespace(ca);
    return r;
  });

  const lispyStructure = Parser.combinator((ca) => {
    whitespace(ca);
    const r = many(fun, false)(ca);
    return r;
  });

  // parser runner code
  const parser = new Parser();
  const result = parser.parse(
    `
(html
  (h1 "hello")
  (p "what's up")
  (list
    (ul (p "hi"))
    (ul (p "bye")))
  (hi))`,
    lispyStructure
  );

  if (result instanceof ParseError) {
    console.log(Parser.format(result));
    throw result;
  } else {
    console.log(parser.target);
    console.log(inspect(result, false, null, true));
  }
});
