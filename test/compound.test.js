import compile from '../src';
import { createException } from '../src/utils';

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
      it('should resolve to expected value', async () => {
        // scenario 1: nested under $and
        let expression = {
          $and: [true, () => Promise.resolve(true)],
        };
        expect(await compile(expression)).toEqual(true);

        // scenario 2: nested under $or
        expression = {
          $or: [false, () => Promise.resolve(true)],
        };
        expect(await compile(expression)).toEqual(true);

        // scenario 3: deeply nested
        expression = {
          $and: [true, { $or: [false, () => Promise.resolve(true)] }],
        };
        expect(await compile(expression)).toEqual(true);
      });

      describe('when it resolves to a non-boolean', () => {
        it('should throw', async () => {
          const expression = {
            $and: [true, () => Promise.resolve('foo')],
          };

          await expect(compile(expression)).rejects.toThrow(
            createException('Unexpected return type [string] from a callback'),
          );
        });
      });
    });

    describe('nested fn returning promise', () => {
      const options = {
        fns: {
          authenticated: () => Promise.resolve(true),
          roleIs: (role) => Promise.resolve(role === 'admin'),
        },
      };

      it('should resolve to expected value', async () => {
        // scenario 1: nested under $or with no args
        let expression = {
          $or: [false, { authenticated: null }],
        };
        expect(await compile(expression, options)).toEqual(true);

        // scenario 2: nested under $and with an arg
        expression = {
          $and: [true, { roleIs: 'admin' }],
        };
        expect(await compile(expression, options)).toEqual(true);

        expression = {
          $and: [true, { roleIs: 'guest' }],
        };
        expect(await compile(expression, options)).toEqual(false);
      });

      describe('when it resolves to a non-boolean', () => {
        const badOptions = {
          fns: { getValue: () => Promise.resolve(1) },
        };

        it('should throw', async () => {
          const expression = { $or: [false, { getValue: null }] };

          await expect(compile(expression, badOptions)).rejects.toThrow(
            createException('Unexpected return type [number] from a function'),
          );
        });
      });
    });
  });
});
