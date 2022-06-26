import { spacesBetween, stringLiteral } from "../src/combinators";
import { Parser } from "../src/parser";

describe("Simple Tests", () => {
  it("should parse with spacesBetween", () => {
    const parser = new Parser();

    const result = parser.parse(
      "hi hello",
      spacesBetween([stringLiteral("hi"), stringLiteral("hello")])
    );

    expect(result).toEqual(["hi", "hello"]);
  });
});
