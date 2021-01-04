import { createException } from './utils';

const operators = { $or: 'some', $and: 'every' };

const getFnArgs = (value) => (Array.isArray(value) ? value : [value]);

const executeFunction = (callCount, type, fn, args = []) => {
  const result = fn(...args);

  if (result instanceof Promise) {
    if (callCount > 1) {
      throw createException(`Unexpected nested promise ${type}`);
    }
  } else {
    const resultType = typeof result;

    if (resultType !== 'boolean') {
      throw createException(
        `Unexpected return type [${resultType}] from a ${type}`,
      );
    }
  }

  return result;
};

// Credit - https://stackoverflow.com/questions/55240828

module.exports = (expression, options = {}) => {
  const { fns = {} } = options;

  let callCount = 0;

  const evaluate = (exp) => {
    callCount += 1;

    if (typeof exp === 'boolean') return exp;

    if (typeof exp === 'function')
      return executeFunction(callCount, 'callback', exp);

    if (!exp || typeof exp !== 'object') return false;

    const [key, value] = Object.entries(exp)[0];

    if (key in operators) return value[operators[key]](evaluate);
    if (key in fns)
      return executeFunction(callCount, 'fn', fns[key], getFnArgs(value));

    if (key) throw createException(`Undefined operation: ${key}`);

    return false;
  };

  return evaluate(expression);
};
