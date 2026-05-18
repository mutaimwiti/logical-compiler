import compile from '../src';

describe('short-circuit semantics', () => {
  it('$or stops after a sync true and skips later async items', () => {
    const spy = jest.fn(() => Promise.resolve(true));
    const result = compile({ $or: [true, spy] });
    expect(result).toEqual(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it('$and stops after a sync false and skips later async items', () => {
    const spy = jest.fn(() => Promise.resolve(true));
    const result = compile({ $and: [false, spy] });
    expect(result).toEqual(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('$or stops after an async true and skips later items', async () => {
    const spy = jest.fn(() => Promise.resolve(true));
    expect(await compile({ $or: [() => Promise.resolve(true), spy] })).toEqual(
      true,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('$and stops after an async false and skips later items', async () => {
    const spy = jest.fn(() => Promise.resolve(true));
    expect(
      await compile({ $and: [() => Promise.resolve(false), spy] }),
    ).toEqual(false);
    expect(spy).not.toHaveBeenCalled();
  });
});
