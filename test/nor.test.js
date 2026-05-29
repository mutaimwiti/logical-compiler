import compile from '../src';

describe('NOR expressions', () => {
  it('should return true only when every operand is false', () => {
    expect(compile({ $nor: [false, false] })).toEqual(true);
    expect(compile({ $nor: [false, true] })).toEqual(false);
    expect(compile({ $nor: [true, false] })).toEqual(false);
    expect(compile({ $nor: [true, true] })).toEqual(false);
  });

  it('should be the negation of $or for callbacks', () => {
    expect(compile({ $nor: [() => false, () => false] })).toEqual(true);
    expect(compile({ $nor: [() => false, () => true] })).toEqual(false);
  });

  it('should handle nested operator expressions', () => {
    const expression = {
      $nor: [false, { $and: [true, false] }],
    };
    expect(compile(expression)).toEqual(true);
  });

  it('$nor of [] should be true (negation of empty $or)', () => {
    expect(compile({ $nor: [] })).toEqual(true);
  });

  describe('returning promise', () => {
    it('should negate the resolved $or', async () => {
      expect(
        await compile({ $nor: [false, () => Promise.resolve(false)] }),
      ).toEqual(true);

      expect(
        await compile({ $nor: [false, () => Promise.resolve(true)] }),
      ).toEqual(false);
    });
  });

  describe('short-circuit', () => {
    it('stops after the first truthy operand and skips later items', () => {
      const spy = jest.fn(() => true);
      expect(compile({ $nor: [true, spy] })).toEqual(false);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
