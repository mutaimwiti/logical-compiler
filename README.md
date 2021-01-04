# boolean-executor

[![build](https://travis-ci.com/mutaimwiti/boolean-executor.svg?branch=master)](https://travis-ci.com/mutaimwiti/boolean-executor)
[![version](https://img.shields.io/npm/v/boolean-executor.svg)](https://www.npmjs.com/package/boolean-executor)
[![downloads](https://img.shields.io/npm/dm/boolean-executor.svg)](https://www.npmjs.com/package/boolean-executor)
[![license](https://img.shields.io/npm/l/boolean-executor.svg)](https://www.npmjs.com/package/boolean-executor)

Evaluate boolean driven expressions.

### Installation

Use one of the two based on your project's dependency manager.

```bash
$ npm install boolean-executor --save

$ yarn add boolean-executor
```

### Getting started

```javascript
import boolExec from 'boolean-executor';

boolExec(expression, options); //false
```

Arguments:

- `expression` - the boolean expression to be executed.
- `options` - an optional object specifying options.
  - `fns` - an optional attribute specifying any function(s) used on the expression.

### AND operator

```javascript
let expression = { $and: [true, true] };
boolExec(expression); //true

expression = { $and: [true, false] };
boolExec(expression); // false

expression = { $and: [false, true] };
boolExec(expression); // false

expression = { $and: [false, false] };
boolExec(expression); // false
```

### OR operator

```javascript
let expression = { $or: [true, true] };
boolExec(expression); //true

expression = { $or: [true, false] };
boolExec(expression); // true

expression = { $or: [false, true] };
boolExec(expression); // true

expression = { $or: [false, false] };
boolExec(expression); // false
```

### Callbacks

#### Simple callback

```javascript
let cb = () => true;
boolExec(cb); // true

cb = () => false;
boolExec(cb); // false
```

#### Promise callback

```javascript
cb = () => Promise.resolve(true);
await boolExec(cb); //true

cb = () => Promise.resolve(false);
await boolExec(cb); // false
```

#### Nested promise callback

```javascript
const expression = {
  $and: [true, () => Promise.resolve(true)],
};

boolExec(expression); // Error: Unexpected nested promise callback
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
boolExec(expression, options); // false

expression = { isEven: 6 };
boolExec(expression, options); // true
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
await boolExec(expression, options); // true

expression = { isEqual: [3, 5] };
await boolExec(expression, options); // false
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

boolExec(expression, options); // Error: Unexpected nested promise fn
```

### Compound expressions

```javascript
let expression = {
  $or: [{ $and: [true, true] }, false],
};

boolExec(expression); // true
```

```javascript
expression = {
  $or: [() => false, () => false],
};

boolExec(expression); // false
```

```javascript
expression = {
  $and: [() => true, true],
};

boolExec(expression); // true
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

boolExec(expression); // true
```

```javascript
const options = {
  fns: {
    any: (target, values) => values.includes(target),
    all: (targets, values) =>
      targets.every((target) => values.includes(target)),
  },
};

expression = {
  $and: [() => true, { $or: [true, false] }, { any: [5, [1, 3, 4, 6, 7]] }],
};

boolExec(expression, options); // false

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

boolExec(expression, options); // true
```

> Operators can be nested in any fashion to achieve the desired logical check.

##### IMPORTANT NOTES

1. An asynchronous call can be made inside a callback or function. Currently, the library does not support promise
   returning callbacks or functions on nested expressions. If one is found, an exception is thrown. Promise returning
   executables are only allowed ALONE. The clean workaround is to resolve values resulting from asynchronous calls 
   before calling `boolExec()`.

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
