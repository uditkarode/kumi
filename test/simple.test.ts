import { spacesBetween, stringl } from "../src/combinators.ts";
import { Parser } from "../src/parser.ts";
import { expect } from "./deps.ts";

Deno.test("should parse with spacesBetween", () => {
  const parser = new Parser();

  const result = parser.parse(
    "hi hello",
    spacesBetween([stringl("hi"), stringl("hello")])
  );

  expect(result).toEqual(["hi", "hello"]);
});
