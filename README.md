# kumi - a parser combinator library

Kumi is a parser combinator library that tries to mimic the way you would normally use Parsec in Haskell.

```haskell
-- Haskell version
cells :: Parser [String]
cells = 
    do first <- cellContent
       next <- remainingCells
       return (first : next)
```

```typescript
// TypeScript version
const cells: Combinator<string[]> = (ca) => {
  const first = cellContent(ca);
  const next = remainingCells(ca);
  return [...first, ...next];
}
```

Here's a tiny example to parse a declaration like `const abcd = "some string value";`:
```typescript
const ConstDecl = Parser.combinator((ca) => {
    // stringl is the string literal combinator, what it does is evident
    stringl("const")(ca);
    
    // the spaces combinator parses 1 or more spaces
    spaces(ca);
    
    // the until combinator parses everything till the specified target is reached
    const identifier = until(" ");
    
    spaces(ca);
    stringl("=")(ca);
    spaces(ca);
    
    // the within combinator parses everything within the given symbols
    const value = within('"', '"')(ca);
    
    stringl(";")(ca);
    
    // any combinator can return any custom value after it's done parsing
    // and any combinator that uses this combinator can then proceed with
    // this return value itself!
    return {
      type: "const-decl",
      identifier, // will be "abcd"
      value, // will be "some string value"
    };
}
```

Let's break this down!

Firstly, `Parser.combinator` is just a way to not have to manually create a `Combinator<T>` value. Here's the definition:
```typescript
static combinator = <T>(v: Combinator<T>) => v; // also doesn't it look much cooler that way? :D
```

Next, `ca`. This is an argument provided to all combinators and stands for Combinator Args. Here's what it is:
```typescript
// note that there's more about the consume function and cursor index below
export type CombinatorArgs = {
  // this is the root consume function
  // at the root of all combinators is the usage of this function
  // it's not very different from the string literal combinator (which just uses this function)
  // however, it's not a combinator. It just matches characters and increases the cursor index
  // note that the type is approximated to keep things simple
  consume: (str: string) => string | ParseError;
  
  // creates a ParserError, you can throw this anywhere to denote a custom parsing error if you wish to
  // any parsing related errors thrown or returned will also be ParseError
  error: (v: { expected: string; found: string }) => ParseError;
  
  // allows you to get and set the value of the cursor index
  cursor: {
    get: () => number;
    set: (pos: number) => void;
  };
};
```

Let's also talk a little bit about the cursor index.
The cursor index is just a number which will be used to index the target string whenever you use the `ca.consume` function.
At the start, the cursor is at index 0.
Here's an example of how it would proceed with the target string `"hello"` and index 0:
```typescript
// ca.consume("hells")
index   target-character    consume-character       matches
0       "hello"[0] = h      "hells"[0] = h          true
1       "hello"[1] = e      "hells"[1] = e          true
2       "hello"[2] = l      "hells"[2] = l          true
3       "hello"[3] = l      "hells"[3] = l          true
4       "hello"[4] = o      "hells"[4] = s          false // ParseError thrown

```

the second argument to `ca.consume` is the backtracking method to use. Currently, there's 3:  

**Never** (default) - __throws__ a ParseError if any character does not match the one at the target string at cursor index  

**OnFail** - __returns__ a ParseError and does not increase the cursor index in case of a failure at any point  

**IfEncountered** - consumes characters until the required character is reached and returns everything it consumed up until then. In case the character passed to it is never reached, throws a ParseError.  

You can use the provided combinators to create even bigger combinators that will ultimately parse your target string.
Remember to pass `ca` to any combinator you want parsing things, or it won't do anything!

That's about it! You can read the tests for more complete examples.
