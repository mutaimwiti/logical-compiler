import compile from '../src';
import { createException } from '../src/utils';

describe('fn expressions', () => {
  it('should return expected value', () => {
    const options = {
      fns: {
        isEven: (number) => number % 2 === 0,
      },
    };

    let expression = { isEven: 7 };
    expect(compile(expression, options)).toEqual(false);

    expression = { isEven: 6 };
    expect(compile(expression, options)).toEqual(true);
  });

  describe('returning promise', () => {
    const options = {
      fns: {
        isEqual: (num1, num2) => Promise.resolve(num1 === num2),
      },
    };

    it('should return expected value', async () => {
      let expression = { isEqual: [3, 3] };

      expect(await compile(expression, options)).toEqual(true);

      expression = { isEqual: [3, 5] };

      expect(await compile(expression, options)).toEqual(false);
    });
  });

  describe('when it returns a non-boolean value', () => {
    const options = {
      fns: {
        getValue: () => 1,
      },
    };

    it('should throw', () => {
      const expression = { getValue: null };

      expect(() => compile(expression, options)).toThrow(
        createException('Unexpected return type [number] from a function'),
      );
    });
  });

  describe('undefined function', () => {
    const options = {
      fns: {},
    };

    it('should throw', () => {
      const expression = { someFn: ['x', 'y'] };

      expect(() => compile(expression, options)).toThrow(
        createException(`Undefined function: 'someFn'`),
      );
    });
  });
});
