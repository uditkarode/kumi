// we need to be able to parse expressions like:
// 2
// 2.4
// +2
// -2
// +2.4
// -2.4
// +2 / +6.4
// -3.2 * 7
// no .4 for now, only 0.4 allowed

import { stringl, firstIn, oneOf, spaces, until } from "../src/combinators";
import { Parser } from "../src/parser";

export const parser = new Parser();

// so in the grand scheme, what we really are parsing is
// expression OR number (lone number)
// where expression = <number> <operator> <number>
// here number can be signed, or decimal, or both

// so let's start -- at first we need a combinator that can parse a number string
// this combinator can parse "2", "64", "3", and so on
// just whole numbers inside a string
const WholeNumber = Parser.combinator((ca) => {
  // here we use firstIn because we want to stop at
  // the first item found. we also want to stop at
  // "." to be able to properly parse decimal values
  // until(X) just returns a string till the next
  // occurence of X that it finds after the cursor
  const result = firstIn([until("."), until(" "), until("\0")])(ca);

  // great, we got a string till the first space.
  // now if it's a number we can return the number
  // from this combinator
  const numberResult = parseInt(result);

  if (isNaN(numberResult))
    throw ca.error({
      expected: "parseable number",
      found: result,
    });

  // note how we looked up a string but can return a number.
  // any combinator that uses this combinator will be able
  // to directly obtain this number from the return value
  return numberResult;
});

// now we need a combinator for a decimal number, which is not very hard
const DecimalNumber = Parser.combinator((ca) => {
  // a decimal has first a whole number, then a decimal, and then another whole number
  // we can depict these by just writing the respective combinators in their expected order
  const beforeDecimal = WholeNumber(ca);
  stringl(".")(ca);
  const afterDecimal = WholeNumber(ca);

  // we can now do our own processing and return the output in any format we'd like
  const result = `${beforeDecimal}.${afterDecimal}`;
  const floatResult = parseFloat(result);
  if (isNaN(floatResult))
    throw ca.error({
      expected: "parseable float",
      found: result,
    });

  return floatResult;
});

const UnsignedNumber = oneOf(DecimalNumber, WholeNumber);

// now, we need to be able to parse signed regular or decimal numbers
// let's create another combinator for that which
// uses our previous number combinator
const SignedNumber = Parser.combinator((ca) => {
  const sign = oneOf(stringl("+"), stringl("-"))(ca);
  // here we can directly get the next number using our previous defined combinators
  const number = UnsignedNumber(ca);

  // that's it! we got our sign and our number
  // let's return it from this combinator
  // for the next combinator to use
  return [sign, number];
});

// great! now we can create a singular type Number
// that can parse both signed and unsigned whole
// and decimal numbers
const Number = oneOf(SignedNumber, UnsignedNumber);

// here's another combinator that just uses the
// combinators we used previously in their
// expected order and returns an array
const Expression = Parser.combinator((ca) => {
  const num1 = Number(ca);
  spaces(ca);
  const operator = oneOf(stringl("*"), stringl("/"))(ca);
  spaces(ca);
  const num2 = Number(ca);

  return [num1, operator, num2];
});

// ultimately we parse (expression OR number), like mentioned at the top
console.log(parser.parse(process.argv[2], oneOf(Expression, Number)));
