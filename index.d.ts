declare function compile(
  expression: compile.Expression,
  options?: compile.Options,
): boolean | Promise<boolean>;

declare namespace compile {
  type Callback = () => boolean | Promise<boolean>;

  type Fn = (...args: any[]) => boolean | Promise<boolean>;

  type Expression =
    | boolean
    | Callback
    | { $and: Expression[] }
    | { $or: Expression[] }
    | { $nor: Expression[] }
    | { $not: Expression }
    | { [fn: string]: any };

  interface Options {
    fns?: Record<string, Fn>;
  }

  type ErrorCode =
    | 'UNRECOGNIZED_OPERATOR'
    | 'UNDEFINED_FUNCTION'
    | 'UNEXPECTED_TOKEN'
    | 'UNEXPECTED_RETURN_TYPE'
    | 'EXPECTED_EXPRESSION';

  class LogicalCompilerError extends Error {
    constructor(message: string, code: ErrorCode);
    name: 'LogicalCompilerError';
    code: ErrorCode;
  }
}

export = compile;
