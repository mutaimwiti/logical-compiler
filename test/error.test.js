import compile from '../src';
import { LogicalCompilerError } from '../src/utils';

describe('LogicalCompilerError', () => {
  it('is exposed on the public export', () => {
    expect(compile.LogicalCompilerError).toBe(LogicalCompilerError);
  });

  it('is an Error subclass carrying a code and prefixed message', () => {
    const error = new LogicalCompilerError('boom', 'SOME_CODE');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(LogicalCompilerError);
    expect(error.name).toEqual('LogicalCompilerError');
    expect(error.code).toEqual('SOME_CODE');
    expect(error.message).toEqual('[logical-compiler]: boom');
  });

  describe('thrown by compile', () => {
    const cases = [
      {
        name: 'missing expression',
        run: () => compile(),
        code: 'EXPECTED_EXPRESSION',
        message: '[logical-compiler]: Expected an expression',
      },
      {
        name: 'invalid token',
        run: () => compile('nope'),
        code: 'UNEXPECTED_TOKEN',
        message: "[logical-compiler]: Unexpected token 'nope'",
      },
      {
        name: 'unrecognized operator',
        run: () => compile({ $someOp: [] }),
        code: 'UNRECOGNIZED_OPERATOR',
        message: "[logical-compiler]: Unrecognized operator: '$someOp'",
      },
      {
        name: 'undefined function',
        run: () => compile({ someFn: [] }),
        code: 'UNDEFINED_FUNCTION',
        message: "[logical-compiler]: Undefined function: 'someFn'",
      },
      {
        name: 'non-boolean return type',
        run: () => compile(() => 'foo'),
        code: 'UNEXPECTED_RETURN_TYPE',
        message:
          '[logical-compiler]: Unexpected return type [string] from a callback',
      },
    ];

    cases.forEach(({ name, run, code, message }) => {
      it(`sets code ${code} for ${name}`, () => {
        expect.assertions(3);

        try {
          run();
        } catch (error) {
          expect(error).toBeInstanceOf(LogicalCompilerError);
          expect(error.code).toEqual(code);
          expect(error.message).toEqual(message);
        }
      });
    });
  });
});
