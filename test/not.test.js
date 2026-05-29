import compile from '../src';

describe('NOT expressions', () => {
  it('should negate a primitive', () => {
    expect(compile({ $not: true })).toEqual(false);
    expect(compile({ $not: false })).toEqual(true);
  });

  it('should negate a callback', () => {
    expect(compile({ $not: () => true })).toEqual(false);
    expect(compile({ $not: () => false })).toEqual(true);
  });

  it('should negate a nested operator expression', () => {
    expect(compile({ $not: { $and: [true, true] } })).toEqual(false);
    expect(compile({ $not: { $or: [false, false] } })).toEqual(true);
  });

  describe('returning promise', () => {
    it('should negate the resolved value', async () => {
      expect(await compile({ $not: () => Promise.resolve(true) })).toEqual(
        false,
      );
      expect(await compile({ $not: () => Promise.resolve(false) })).toEqual(
        true,
      );
    });

    it('should negate a nested async expression', async () => {
      const expression = {
        $not: { $or: [false, () => Promise.resolve(true)] },
      };
      expect(await compile(expression)).toEqual(false);
    });
  });
});
