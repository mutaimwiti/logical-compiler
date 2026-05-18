import { createException } from './utils';

const getFnArgs = (value) => (Array.isArray(value) ? value : [value]);

const assertBoolean = (value, type) => {
  if (typeof value !== 'boolean') {
    throw createException(
      `Unexpected return type [${typeof value}] from a ${type}`,
    );
  }

  return value;
};

const executeFunction = (type, fn, args = []) => {
  const result = fn(...args);

  if (result instanceof Promise) {
    return result.then((v) => assertBoolean(v, type));
  }

  return assertBoolean(result, type);
};

// Sequential short-circuit iterator: stops on the first child whose (resolved) value
// equals `shortCircuitOn`. Sync and async children share the same control flow:
// when a child returns a Promise, the rest of the walk continues inside `.then`.
const stepAll = (items, evaluate, shortCircuitOn) => {
  let i = 0;

  const step = () => {
    while (i < items.length) {
      const r = evaluate(items[i]);

      i += 1;

      if (r instanceof Promise) {
        return r.then((v) => (v === shortCircuitOn ? v : step()));
      }

      if (r === shortCircuitOn) return r;
    }

    return !shortCircuitOn;
  };

  return step();
};

const operators = {
  $and: (items, evaluate) => stepAll(items, evaluate, false),
  $or: (items, evaluate) => stepAll(items, evaluate, true),
};

module.exports = (expression, options = {}) => {
  if (expression === undefined) {
    throw createException('Expected an expression');
  }

  const { fns = {} } = options;

  const evaluate = (exp) => {
    if (typeof exp === 'boolean') return exp;

    if (typeof exp === 'function') return executeFunction('callback', exp);

    if (!exp || typeof exp !== 'object') {
      throw createException(`Unexpected token '${exp}'`);
    }

    const [key, value] = Object.entries(exp)[0];

    if (key in operators) return operators[key](value, evaluate);
    if (key in fns) {
      return executeFunction('function', fns[key], getFnArgs(value));
    }

    if (key) {
      const message = key.startsWith('$')
        ? `Unrecognized operator: '${key}'`
        : `Undefined function: '${key}'`;

      throw createException(message);
    }

    return false;
  };

  return evaluate(expression);
};
