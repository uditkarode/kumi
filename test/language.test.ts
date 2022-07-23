import { spaces, stringl, until, within } from "../src/combinators.ts";
import { Parser } from "../src/parser.ts";
import { expect } from "./deps.ts";

Deno.test("can parse an example assignment", () => {
  const ConstExpr = Parser.combinator((ca) => {
    stringl("const")(ca);
    spaces(ca);
    const identifier = until(" ")(ca);
    spaces(ca);
    stringl("=")(ca);
    spaces(ca);
    const value = within('"', '"')(ca);
    stringl(";")(ca);

    return {
      type: "const-string-declaration",
      identifier,
      value,
    };
  });

  const parser = new Parser();
  const result = parser.parse('const name = "kumi";', ConstExpr);

  expect(result).toEqual({
    type: "const-string-declaration",
    identifier: "name",
    value: "kumi",
  });
});
