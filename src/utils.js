export const createException = (message) => {
  return Error(`[logical-compiler]: ${message}`);
};
