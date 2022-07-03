import { many, spaces, stringl, within } from "../src/combinators";
import { Parser } from "../src/parser";
import { Backtrack } from "../src/utils";

it("can parse an example assignment", () => {
  const ConstExpr = Parser.combinator((ca) => {
    stringl("const")(ca);
    spaces(ca);
    const identifier = ca.consume(" ", Backtrack.IfEncountered);
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
