export class LogicalCompilerError extends Error {
  constructor(message, code) {
    super(`[logical-compiler]: ${message}`);
    this.name = 'LogicalCompilerError';
    this.code = code;
  }
}

export const createException = (message, code) =>
  new LogicalCompilerError(message, code);
