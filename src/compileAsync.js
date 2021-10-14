import { createException } from './utils';

// Credit - https://advancedweb.hu/how-to-use-async-functions-with-array-some-and-every-in-javascript/

const asyncSome = async (arr, predicate) => {
  for (const e of arr) {
    if (await predicate(e)) return true;
  }
  return false;
};

const asyncEvery = async (arr, predicate) => {
  for (const e of arr) {
    if (!(await predicate(e))) return false;
  }
  return true;
};

const operators = {
  $or: asyncSome,
  $and: asyncEvery,
};

const getFnArgs = (value) => (Array.isArray(value) ? value : [value]);

const executeFunction = async (type, fn, args = []) => {
  const result = await fn(...args);

  const resultType = typeof result;

  if (resultType !== 'boolean') {
    throw createException(
      `Unexpected return type [${resultType}] from a ${type}`,
    );
  }

  return result;
};

const compileAsync = async (expression, options = {}) => {
  if (expression === undefined) {
    throw createException('Expected an expression');
  }

  const { fns = {} } = options;

  // make all recursive calls await fn()
  const evaluate = async (exp) => {
    if (typeof exp === 'boolean') return exp;

    if (typeof exp === 'function') return executeFunction('callback', exp);

    if (!exp || typeof exp !== 'object') {
      throw createException(`Unexpected token '${exp}'`);
    }

    const [key, value] = Object.entries(exp)[0];

    if (key in operators) return operators[key](value, evaluate);
    if (key in fns)
      return executeFunction('function', fns[key], getFnArgs(value));

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

module.exports = compileAsync;
