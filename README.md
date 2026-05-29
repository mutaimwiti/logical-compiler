# logical-compiler

[![build](https://github.com/mutaimwiti/logical-compiler/actions/workflows/ci.yml/badge.svg)](https://github.com/mutaimwiti/logical-compiler/actions/workflows/ci.yml)
[![version](https://img.shields.io/npm/v/logical-compiler.svg)](https://www.npmjs.com/package/logical-compiler)
[![downloads](https://img.shields.io/npm/dm/logical-compiler.svg)](https://www.npmjs.com/package/logical-compiler)
[![license](https://img.shields.io/npm/l/logical-compiler.svg)](https://www.npmjs.com/package/logical-compiler)

Compile MongoDB-like boolean expressions based on boolean operators `AND` and `OR`

### Installation

Use one of the two based on your project's dependency manager.

```bash
$ npm install logical-compiler --save

$ yarn add logical-compiler
```

### Getting started

```javascript
import compile from 'logical-compiler';

compile(expression, options);
```

Arguments:

- `expression` - the boolean expression to be executed.
- `options` - an optional object specifying options.
  - `fns` - an optional attribute specifying any function(s) used on the expression.
   
### Operators

#### AND operator

```javascript
let expression = { $and: [true, true] };
compile(expression); // true

expression = { $and: [true, false] };
compile(expression); // false

expression = { $and: [false, true] };
compile(expression); // false

expression = { $and: [false, false] };
compile(expression); // false
```

#### OR operator

```javascript
let expression = { $or: [true, true] };
compile(expression); // true

expression = { $or: [true, false] };
compile(expression); // true

expression = { $or: [false, true] };
compile(expression); // true

expression = { $or: [false, false] };
compile(expression); // false
```

#### NOT operator

`$not` takes a single expression and returns its negation.

```javascript
let expression = { $not: true };
compile(expression); // false

expression = { $not: { $and: [true, true] } };
compile(expression); // false
```

#### NOR operator

`$nor` takes an array and returns the negation of `$or` over it, i.e. `true`
only when every operand is `false`.

```javascript
let expression = { $nor: [false, false] };
compile(expression); // true

expression = { $nor: [false, true] };
compile(expression); // false
```

#### Unrecognized operator
```javascript
const expression = { $someOp: ['x', 'y'] };

compile(expression); // Error: Unrecognized operator: '$someOp'
```

### Primitives

#### undefined
```javascript
compile(); // Error: Expected an expression
```

#### boolean
```javascript
compile(true); // true

compile(false); // false
```

#### string
```javascript
const expression = 'test';

compile(expression); // Error: Unexpected token 'test'
```

#### number
```javascript
const expression = 201;

compile(expression); // Error: Unexpected token '201'
```

### Callbacks

A callback is a function that returns a boolean. If it returns a promise,
`compile` resolves to a promise you `await`.

```javascript
let cb = () => true;
compile(cb); // true

cb = () => Promise.resolve(false);
await compile(cb); // false
```

#### Nested promise callback

```javascript
const expression = {
  $and: [true, () => Promise.resolve(true)],
};

await compile(expression); // true
```

### Functions

A function is defined on the `fns` attribute of the `options` argument. It may
return a boolean or a promise.

```javascript
const options = {
  fns: {
    isEven: (number) => number % 2 === 0,
    isEqual: (num1, num2) => Promise.resolve(num1 === num2),
  },
};

compile({ isEven: 6 }, options); // true

await compile({ isEqual: [3, 5] }, options); // false
```

#### Nested promise function

```javascript
const options = {
  fns: {
    authenticated: () => Promise.resolve(true),
  },
};

const expression = {
  $or: [false, { authenticated: null }],
};

await compile(expression, options); // true
```

#### Undefined function

```javascript
const expression = { someFn: ['x', 'y'] };

compile(expression, options); // Error: Undefined function: 'someFn'
````

### Compound expressions

```javascript
let expression = {
  $or: [{ $and: [true, true] }, false],
};

compile(expression); // true
```

```javascript
expression = {
  $or: [() => false, () => false],
};

compile(expression); // false
```

```javascript
expression = {
  $and: [() => true, true],
};

compile(expression); // true
```

```javascript
expression = {
  $or: [
    () => false,
    false,
    {
      $and: [true, { $or: [() => true, false] }],
    },
  ],
};

compile(expression); // true
```

```javascript
const options = {
  fns: {
    any: (target, values) => values.includes(target),
    all: (targets, values) => targets.every((target) => values.includes(target)),
  },
};

expression = {
  $and: [
    () => true, 
    { $or: [true, false] },
    { any: [5, [1, 3, 4, 6, 7]] }
  ],
};

compile(expression, options); // false

expression = {
  $or: [
    () => false,
    false,
    { $and: [true, false] },
    {
      all: [
        [3, 4, 7],
        [2, 3, 4, 5, 6, 7],
      ],
    },
  ],
};

compile(expression, options); // true
```

> Operators can be nested in any fashion to achieve the desired logical check.

### Multiple keys (implicit AND)

When an object expression has more than one key, the keys are AND-ed together,
at any nesting depth. This applies to operators and functions alike.

```javascript
const options = {
  fns: {
    isEven: (number) => number % 2 === 0,
  },
};

let expression = { $or: [false, true], isEven: 6 };
compile(expression, options); // true  ($or AND isEven)

expression = { $or: [false, true], isEven: 7 };
compile(expression, options); // false ($or is true, but isEven is false)
```

An empty object is not a valid expression and throws:

```javascript
compile({}); // Error: Expected an expression
```

##### IMPORTANT NOTES

1. `compile` returns `boolean` for fully synchronous expressions and `Promise<boolean>` when any callback or
   function returns a promise. `$and` stops at the first `false`; `$or` stops at the first `true`. Later operands
   (including async ones) are not evaluated.

2. Callbacks and functions must explicitly return boolean values to avoid the ambiguity of relying on truthiness. 
   Relying on truthiness would pose a serious loophole because the executable might accidentally resolve to true on a 
   non-boolean value. If the library encounters a callback that resolves to a non-boolean value, it throws an exception. 
   See [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) documentation on truthy values.

### Error handling

All errors thrown by `compile` are instances of `LogicalCompilerError`, a
subclass of `Error` that carries a `.code` field for programmatic handling. The
human-readable `.message` is unchanged.

```javascript
import compile from 'logical-compiler';

try {
  compile({ $unknown: [] });
} catch (error) {
  error instanceof compile.LogicalCompilerError; // true
  error.code; // 'UNRECOGNIZED_OPERATOR'
}
```

Codes: `UNRECOGNIZED_OPERATOR`, `UNDEFINED_FUNCTION`, `UNEXPECTED_TOKEN`,
`UNEXPECTED_RETURN_TYPE`, `EXPECTED_EXPRESSION`.

### TypeScript

Type declarations ship with the package, so no separate `@types` install is
needed. The supporting types `compile.Expression`, `compile.Options`, and
`compile.LogicalCompilerError` are available for use in your own code.

### Licence

[MIT](https://mit-license.org/) © Mutai Mwiti |
[GitHub](https://github.com/mutaimwiti) |
[GitLab](https://gitlab.com/mutaimwiti)

_**DISCLAIMER:**_
_All opinions expressed in this repository are mine and do not reflect any company or organisation I'm involved with._
