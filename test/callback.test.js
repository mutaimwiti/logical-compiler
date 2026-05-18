import compile from '../src';
import { createException } from '../src/utils';

describe('callback expressions', () => {
  it('should return expected value', () => {
    let cb = () => true;

    expect(compile(cb)).toEqual(true);

    cb = () => false;

    expect(compile(cb)).toEqual(false);
  });

  describe('returning promise', () => {
    it('should return expected value', async () => {
      let cb = () => Promise.resolve(true);

      expect(await compile(cb)).toEqual(true);

      cb = () => Promise.resolve(false);

      expect(await compile(cb)).toEqual(false);
    });
  });

  describe('when it returns a non-boolean value', () => {
    it('should throw', () => {
      const callback = () => 'foo';

      expect(() => compile(callback)).toThrow(
        createException('Unexpected return type [string] from a callback'),
      );
    });
  });
});
