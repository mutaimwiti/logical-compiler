import compile from '../src';
import { createException } from '../src/utils';

describe('multi-key expressions (implicit AND)', () => {
  it('ANDs the keys of an object together', () => {
    expect(compile({ $and: [true], $or: [false] })).toEqual(false);
    expect(compile({ $and: [true], $or: [true] })).toEqual(true);
    expect(compile({ $or: [true], $not: false })).toEqual(true);
    expect(compile({ $or: [true], $not: true })).toEqual(false);
  });

  it('ANDs operators with functions', () => {
    const options = { fns: { isEven: (n) => n % 2 === 0 } };

    expect(compile({ $and: [true, true], isEven: 6 }, options)).toEqual(true);
    expect(compile({ $and: [true, true], isEven: 7 }, options)).toEqual(false);
  });

  it('applies at any nesting depth', () => {
    const options = { fns: { gt: (a, b) => a > b } };
    const expression = {
      $or: [false, { $and: [true], gt: [5, 3] }],
    };
    expect(compile(expression, options)).toEqual(true);

    expression.$or[1].gt = [1, 3]; // now the nested AND is false
    expect(compile(expression, options)).toEqual(false);
  });

  describe('short-circuit', () => {
    it('stops at the first falsy key and skips later ones', () => {
      const spy = jest.fn(() => true);
      const result = compile(
        { $and: [false], later: spy },
        { fns: { later: spy } },
      );
      expect(result).toEqual(false);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('returning promise', () => {
    it('resolves the implicit AND across async keys', async () => {
      const options = {
        fns: { roleIs: (r) => Promise.resolve(r === 'admin') },
      };

      expect(
        await compile({ $or: [false, true], roleIs: 'admin' }, options),
      ).toEqual(true);

      expect(
        await compile({ $or: [false, true], roleIs: 'guest' }, options),
      ).toEqual(false);
    });
  });

  describe('empty object', () => {
    it('throws a clean error', () => {
      expect(() => compile({})).toThrow(
        createException('Expected an expression', 'EXPECTED_EXPRESSION'),
      );
    });
  });
});
