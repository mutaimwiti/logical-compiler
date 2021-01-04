import compile from '../src';
import { createException } from '../src/utils';

describe('compile()', function () {
  it('should return false by default', () => {
    expect(compile()).toEqual(false);
  });

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

  describe('AND expressions', () => {
    it('should return expected value', () => {
      let expression = { $and: [true, true] };
      expect(compile(expression)).toEqual(true);

      expression = { $and: [true, false] };
      expect(compile(expression)).toEqual(false);

      expression = { $and: [false, true] };
      expect(compile(expression)).toEqual(false);

      expression = { $and: [false, false] };
      expect(compile(expression)).toEqual(false);
    });
  });

  describe('OR expressions', () => {
    it('should return expected value', () => {
      let expression = { $or: [true, true] };
      expect(compile(expression)).toEqual(true);

      expression = { $or: [true, false] };
      expect(compile(expression)).toEqual(true);

      expression = { $or: [false, true] };
      expect(compile(expression)).toEqual(true);

      expression = { $or: [false, false] };
      expect(compile(expression)).toEqual(false);
    });
  });

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
          createException('Unexpected return type [number] from a fn'),
        );
      });
    });
  });

  describe('compound expressions', () => {
    describe('AND - OR expressions', () => {
      it('should return expected value ', () => {
        // scenario 1
        let expression = {
          $or: [{ $and: [true, true] }, false],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 2
        expression = {
          $or: [{ $and: [true, false] }, false],
        };
        expect(compile(expression)).toEqual(false);

        // scenario 3
        expression = {
          $and: [true, { $or: [false, true] }],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 4
        expression = {
          $and: [false, { $or: [false, true] }],
        };
        expect(compile(expression)).toEqual(false);
      });
    });

    describe('OR - callback expressions', () => {
      it('should return expected values ', () => {
        let expression = {
          $or: [() => true, true],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 2
        expression = {
          $or: [true, () => false],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 3
        expression = {
          $or: [() => false, () => true],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 4
        expression = {
          $or: [() => false, () => false],
        };
        expect(compile(expression)).toEqual(false);
      });
    });

    describe('AND - callback expressions', () => {
      it('should return expected values ', () => {
        let expression = {
          $and: [() => true, true],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 2
        expression = {
          $and: [true, () => false],
        };
        expect(compile(expression)).toEqual(false);

        // scenario 3
        expression = {
          $and: [() => false, () => true],
        };
        expect(compile(expression)).toEqual(false);

        // scenario 4
        expression = {
          $and: [() => false, () => false],
        };
        expect(compile(expression)).toEqual(false);
      });
    });

    describe('AND - OR - callback expressions', () => {
      it('should return expected values ', () => {
        // scenario 1
        let expression = {
          $and: [() => true, { $or: [false, () => true] }],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 2
        expression = {
          $and: [() => false, { $or: [true, false] }],
        };
        expect(compile(expression)).toEqual(false);

        // scenario 3
        expression = {
          $or: [() => false, false, { $and: [true, true] }],
        };
        expect(compile(expression)).toEqual(true);

        // scenario 4
        expression = {
          $or: [() => false, false, { $and: [true, false] }],
        };
        expect(compile(expression)).toEqual(false);

        // scenario 5
        expression = {
          $or: [
            () => false,
            false,
            {
              $and: [
                true,
                {
                  $or: [() => true, false],
                },
              ],
            },
          ],
        };
        expect(compile(expression)).toEqual(true);
      });
    });

    describe('AND - OR - fn - callback expressions', () => {
      it('should return expected values ', () => {
        const options = {
          fns: {
            any: (target, values) => values.includes(target),
            all: (targets, values) =>
              targets.every((target) => values.includes(target)),
          },
        };
        // scenario 1
        let expression = {
          $and: [
            () => true,
            { $or: [false, () => true] },
            { any: [5, [1, 3, 4, 5, 6]] },
          ],
        };
        expect(compile(expression, options)).toEqual(true);

        // scenario 2
        expression = {
          $and: [
            () => true,
            { $or: [true, false] },
            { any: [5, [1, 3, 4, 6, 7]] },
          ],
        };
        expect(compile(expression, options)).toEqual(false);

        // scenario 3
        expression = {
          $or: [
            () => false,
            false,
            { $and: [true, false] },
            {
              all: [
                [3, 4, 7],
                [2, 3, 4, 5, 6, 7],
              ],
            },
          ],
        };
        expect(compile(expression, options)).toEqual(true);

        // scenario 4
        expression = {
          $or: [
            () => false,
            false,
            { $and: [true, false] },
            {
              all: [
                [3, 7, 9],
                [2, 3, 4, 5, 6],
              ],
            },
          ],
        };
        expect(compile(expression, options)).toEqual(false);

        // scenario 5
        expression = {
          $or: [
            () => false,
            false,
            {
              $and: [
                true,
                {
                  $and: [true, () => true, { any: [2, [5, 2, 3, 4]] }],
                },
              ],
            },
          ],
        };
        expect(compile(expression, options)).toEqual(true);
      });

      describe('nested callback returning promise', () => {
        it('should throw', () => {
          const expression = {
            $and: [true, () => Promise.resolve(true)],
          };

          expect(() => compile(expression)).toThrow(
            createException('Unexpected nested promise callback'),
          );
        });
      });

      describe('nested fn returning promise', () => {
        const options = {
          fns: {
            authenticated: () => Promise.resolve(true),
          },
        };

        it('should throw', () => {
          const expression = {
            $or: [false, { authenticated: null }],
          };

          expect(() => compile(expression, options)).toThrow(
            createException('Unexpected nested promise fn'),
          );
        });
      });
    });
  });
});
