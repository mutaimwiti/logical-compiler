# logical-compiler

[![build](https://travis-ci.com/mutaimwiti/logical-compiler.svg?branch=main)](https://travis-ci.com/mutaimwiti/logical-compiler)
[![version](https://img.shields.io/npm/v/logical-compiler.svg)](https://www.npmjs.com/package/logical-compiler)
[![downloads](https://img.shields.io/npm/dm/logical-compiler.svg)](https://www.npmjs.com/package/logical-compiler)
[![license](https://img.shields.io/npm/l/logical-compiler.svg)](https://www.npmjs.com/package/logical-compiler)

Compile MongoDB-like boolean expressions based on boolean operators `AND` and `OR`.

### Installation

Use one of the two based on your project's dependency manager.

```bash
$ npm install logical-compiler --save

$ yarn add logical-compiler
```

### Getting started

```javascript
import compile from 'logical-compiler';

compile(expression, options); //false
```

Arguments:

- `expression` - the boolean expression to be executed.
- `options` - an optional object specifying options.
  - `fns` - an optional attribute specifying any function(s) used on the expression.
   
### Operators

#### AND operator

```javascript
let expression = { $and: [true, true] };
compile(expression); //true

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
compile(expression); //true

expression = { $or: [true, false] };
compile(expression); // true

expression = { $or: [false, true] };
compile(expression); // true

expression = { $or: [false, false] };
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

#### Simple callback

```javascript
let cb = () => true;
compile(cb); // true

cb = () => false;
compile(cb); // false
```

#### Promise callback

```javascript
cb = () => Promise.resolve(true);
await compile(cb); //true

cb = () => Promise.resolve(false);
await compile(cb); // false
```

#### Nested promise callback

```javascript
const expression = {
  $and: [true, () => Promise.resolve(true)],
};

compile(expression); // Error: Unexpected nested promise callback
```

### Functions

#### Simple function

```javascript
const options = {
  fns: {
    isEven: (number) => number % 2 === 0,
  },
};

let expression = { isEven: 7 };
compile(expression, options); // false

expression = { isEven: 6 };
compile(expression, options); // true
```

> Note that the function is defined on the `fns` attribute of the `options` argument.

#### Promise function

```javascript
const options = {
  fns: {
    isEqual: (num1, num2) => Promise.resolve(num1 === num2),
  },
};

expression = { isEqual: [3, 3] };
await compile(expression, options); // true

expression = { isEqual: [3, 5] };
await compile(expression, options); // false
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

compile(expression, options); // Error: Unexpected nested promise function
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

##### IMPORTANT NOTES

1. An asynchronous call can be made inside a callback or function. Currently, the library does not support promise
   returning callbacks or functions on nested expressions. If one is found, an exception is thrown. Promise returning
   executables are only allowed ALONE. The clean workaround is to resolve values resulting from asynchronous calls 
   before invoking the compiler.

2. Callbacks and functions must explicitly return boolean values to avoid the ambiguity of relying on truthiness. 
   Relying on truthiness would pose a serious loophole because the executable might accidentally resolve to true on a 
   non-boolean value. If the library encounters a callback that resolves to a non-boolean value, it throws an exception. 
   See [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) documentation on truthy values.

### Licence

[MIT](https://mit-license.org/) © Mutai Mwiti |
[GitHub](https://github.com/mutaimwiti) |
[GitLab](https://gitlab.com/mutaimwiti)

_**DISCLAIMER:**_
_All opinions expressed in this repository are mine and do not reflect any company or organisation I'm involved with._
