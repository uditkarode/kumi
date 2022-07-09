import { many, oneOf, stringl, within } from "../src/combinators";
import { ParseError } from "../src/parse-error";
import { Parser } from "../src/parser";

it("should be able to parse markdown", () => {
  const son = Parser.combinator((ca) => {
    many(oneOf(stringl("\n"), stringl(" ")))(ca);
  });

  const md = Parser.combinator((ca) => {
    const fun = within("(", ")")(ca);
    son(ca);
    return fun;
  });

  const parser = new Parser();
  const result = parser.parse(
    `
(h1)
(p)`,
    (ca) => {
      son(ca);
      return many(md)(ca);
    }
  );

  if (result instanceof ParseError) {
    console.log(Parser.format(result));
    throw result;
  } else {
    console.log(parser.target);
    console.log(result);
  }
});
