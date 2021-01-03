const operators = {$or: 'some', $and: 'every'};

const getFnArgs = (value) => Array.isArray(value) ? value : [value];

export const boolEval = (expression, options = {}) => {
    const {fns = {}} = options;

    const evaluate = (exp) => {
        if (typeof exp === 'boolean') return exp;
        if (typeof exp === 'function') return exp();
        if (!exp || typeof exp !== 'object') return false;

        const [key, value] = Object.entries(exp)[0];

        if (key in operators) return value[operators[key]](evaluate);
        if (key in fns) return fns[key](...getFnArgs(value));
        if (key) throw Error(`Undefined operation: ${key}`);

        return false;
    };

    return evaluate(expression);
}
