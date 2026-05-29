import { createException, LogicalCompilerError } from './utils';

const getFnArgs = (value) => (Array.isArray(value) ? value : [value]);

const assertBoolean = (value, type) => {
  if (typeof value !== 'boolean') {
    throw createException(
      `Unexpected return type [${typeof value}] from a ${type}`,
      'UNEXPECTED_RETURN_TYPE',
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

// Negation that preserves the sync/async contract: a sync child negates
// immediately, a promise child negates once it resolves.
const negate = (r) => (r instanceof Promise ? r.then((v) => !v) : !r);

const operators = {
  $and: (items, evaluate) => stepAll(items, evaluate, false),
  $or: (items, evaluate) => stepAll(items, evaluate, true),
  $not: (value, evaluate) => negate(evaluate(value)),
  $nor: (items, evaluate) => negate(stepAll(items, evaluate, true)),
};

const compile = (expression, options = {}) => {
  if (expression === undefined) {
    throw createException('Expected an expression', 'EXPECTED_EXPRESSION');
  }

  const { fns = {} } = options;

  const evaluate = (exp) => {
    if (typeof exp === 'boolean') return exp;

    if (typeof exp === 'function') return executeFunction('callback', exp);

    if (!exp || typeof exp !== 'object') {
      throw createException(`Unexpected token '${exp}'`, 'UNEXPECTED_TOKEN');
    }

    const entries = Object.entries(exp);

    if (entries.length === 0) {
      throw createException('Expected an expression', 'EXPECTED_EXPRESSION');
    }

    // Multiple keys are implicitly AND-ed together (e.g. { $or: [...], fn: x }
    // means $or AND fn), at any nesting depth. Each entry is evaluated as its
    // own single-key expression, reusing the short-circuit AND walker so
    // sync/async handling and short-circuit come for free.
    if (entries.length > 1) {
      return stepAll(
        entries.map(([k, v]) => ({ [k]: v })),
        evaluate,
        false,
      );
    }

    const [key, value] = entries[0];

    if (key in operators) return operators[key](value, evaluate);
    if (key in fns) {
      return executeFunction('function', fns[key], getFnArgs(value));
    }

    if (key) {
      const [message, code] = key.startsWith('$')
        ? [`Unrecognized operator: '${key}'`, 'UNRECOGNIZED_OPERATOR']
        : [`Undefined function: '${key}'`, 'UNDEFINED_FUNCTION'];

      throw createException(message, code);
    }

    return false;
  };

  return evaluate(expression);
};

compile.LogicalCompilerError = LogicalCompilerError;

module.exports = compile;
