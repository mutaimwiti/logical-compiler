const operators = {$or: 'some', $and: 'every'};

export const boolEval = (expression, options = {}) => {

    const {fns = {}} = options;

    if (typeof expression === 'boolean') return expression;
    if (typeof expression === 'function') return expression();
    if (!expression || typeof expression !== 'object') return false;

    const [key, value] = Object.entries(expression)[0];

    if (key in operators) return value[operators[key]](boolEval, options);
    if (key in fns) return fns[key](value);

    return false;
}
