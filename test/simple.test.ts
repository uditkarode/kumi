import { spacesBetween, stringl } from "../src/combinators";
import { Parser } from "../src/parser";

it("should parse with spacesBetween", () => {
  const parser = new Parser();

  const result = parser.parse(
    "hi hello",
    spacesBetween([stringl("hi"), stringl("hello")])
  );

  expect(result).toEqual(["hi", "hello"]);
});
