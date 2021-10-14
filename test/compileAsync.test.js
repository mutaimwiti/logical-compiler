import compileAsync from '../src/compileAsync';
import { createException } from '../src/utils';

describe('compileAsync()', function () {
  describe('primitive expressions', () => {
    describe('undefined', () => {
      it('should throw', async () => {
        expect.assertions(1);

        try {
          await compileAsync();
        } catch (e) {
          expect(e).toEqual(createException(`Expected an expression`));
        }
      });
    });

    describe('boolean', () => {
      it('should return input', async () => {
        expect(await compileAsync(true)).toEqual(true);
        expect(await compileAsync(false)).toEqual(false);
      });
    });

    describe('string', () => {
      it('should throw', async () => {
        expect.assertions(1);

        const expression = 'some string';

        try {
          await compileAsync(expression);
        } catch (e) {
          expect(e).toEqual(
            createException(`Unexpected token '${expression}'`),
          );
        }
      });
    });

    describe('number', () => {
      it('should throw', async () => {
        expect.assertions(1);

        const expression = 201;

        try {
          await compileAsync(expression);
        } catch (e) {
          expect(e).toEqual(
            createException(`Unexpected token '${expression}'`),
          );
        }
      });
    });

    describe('object', () => {
      it('should throw', async () => {
        expect.assertions(1);

        const expression = 201;

        try {
          await compileAsync(expression);
        } catch (e) {
          expect(e).toEqual(
            createException(`Unexpected token '${expression}'`),
          );
        }
      });
    });
  });

  describe('callback expressions', () => {
    it('should return expected value', async () => {
      let cb = () => true;

      expect(await compileAsync(cb)).toEqual(true);

      cb = () => false;

      expect(await compileAsync(cb)).toEqual(false);
    });

    describe('returning promise', () => {
      it('should return expected value', async () => {
        let cb = () => Promise.resolve(true);

        expect(await compileAsync(cb)).toEqual(true);

        cb = () => Promise.resolve(false);

        expect(await compileAsync(cb)).toEqual(false);
      });
    });

    describe('when it returns a non-boolean value', () => {
      it('should throw', async () => {
        expect.assertions(1);

        const callback = () => 'foo';

        try {
          await compileAsync(callback);
        } catch (e) {
          expect(e).toEqual(
            createException(`Unexpected return type [string] from a callback`),
          );
        }
      });
    });
  });

  describe('operator expressions', () => {
    describe('AND expressions', () => {
      it('should return expected value', async () => {
        let expression = { $and: [true, true] };
        expect(await compileAsync(expression)).toEqual(true);

        expression = { $and: [true, false] };
        expect(await compileAsync(expression)).toEqual(false);

        expression = { $and: [false, true] };
        expect(await compileAsync(expression)).toEqual(false);

        expression = { $and: [false, false] };
        expect(await compileAsync(expression)).toEqual(false);
      });
    });

    describe('OR expressions', () => {
      it('should return expected value', async () => {
        let expression = { $or: [true, true] };
        expect(await compileAsync(expression)).toEqual(true);

        expression = { $or: [true, false] };
        expect(await compileAsync(expression)).toEqual(true);

        expression = { $or: [false, true] };
        expect(await compileAsync(expression)).toEqual(true);

        expression = { $or: [false, false] };
        expect(await compileAsync(expression)).toEqual(false);
      });
    });

    describe('unrecognized operator', () => {
      it('should throw', async () => {
        expect.assertions(1);

        const expression = { $someOp: ['x', 'y'] };

        try {
          await compileAsync(expression);
        } catch (e) {
          expect(e).toEqual(
            createException(`Unrecognized operator: '$someOp'`),
          );
        }
      });
    });
  });

  describe('fn expressions', () => {
    it('should return expected value', async () => {
      const options = {
        fns: {
          isEven: (number) => number % 2 === 0,
        },
      };

      let expression = { isEven: 7 };
      expect(await compileAsync(expression, options)).toEqual(false);

      expression = { isEven: 6 };
      expect(await compileAsync(expression, options)).toEqual(true);
    });

    describe('returning promise', () => {
      const options = {
        fns: {
          isEqual: (num1, num2) => Promise.resolve(num1 === num2),
        },
      };

      it('should return expected value', async () => {
        let expression = { isEqual: [3, 3] };

        expect(await compileAsync(expression, options)).toEqual(true);

        expression = { isEqual: [3, 5] };

        expect(await compileAsync(expression, options)).toEqual(false);
      });
    });

    describe('when it returns a non-boolean value', () => {
      const options = {
        fns: {
          getValue: () => 1,
        },
      };

      it('should throw', async () => {
        expect.assertions(1);

        const expression = { getValue: null };

        try {
          await compileAsync(expression, options);
        } catch (e) {
          expect(e).toEqual(
            createException(`Unexpected return type [number] from a function`),
          );
        }
      });
    });

    describe('undefined function', () => {
      const options = {
        fns: {},
      };

      it('should throw', async () => {
        expect.assertions(1);

        const expression = { someFn: ['x', 'y'] };

        try {
          await compileAsync(expression, options);
        } catch (e) {
          expect(e).toEqual(createException(`Undefined function: 'someFn'`));
        }
      });
    });
  });

  describe('compound expressions', () => {
    describe('AND - OR expressions', () => {
      it('should return expected value ', async () => {
        // scenario 1
        let expression = {
          $or: [{ $and: [true, true] }, false],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 2
        expression = {
          $or: [{ $and: [true, false] }, false],
        };
        expect(await compileAsync(expression)).toEqual(false);

        // scenario 3
        expression = {
          $and: [true, { $or: [false, true] }],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 4
        expression = {
          $and: [false, { $or: [false, true] }],
        };
        expect(await compileAsync(expression)).toEqual(false);
      });
    });

    describe('OR - callback expressions', () => {
      it('should return expected values ', async () => {
        let expression = {
          $or: [() => true, true],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 2
        expression = {
          $or: [true, () => false],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 3
        expression = {
          $or: [() => false, () => true],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 4
        expression = {
          $or: [() => false, () => false],
        };
        expect(await compileAsync(expression)).toEqual(false);
      });
    });

    describe('AND - callback expressions', () => {
      it('should return expected values ', async () => {
        let expression = {
          $and: [() => true, true],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 2
        expression = {
          $and: [true, () => false],
        };
        expect(await compileAsync(expression)).toEqual(false);

        // scenario 3
        expression = {
          $and: [() => false, () => true],
        };
        expect(await compileAsync(expression)).toEqual(false);

        // scenario 4
        expression = {
          $and: [() => false, () => false],
        };
        expect(await compileAsync(expression)).toEqual(false);
      });
    });

    describe('AND - OR - callback expressions', () => {
      it('should return expected values ', async () => {
        // scenario 1
        let expression = {
          $and: [() => true, { $or: [false, () => true] }],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 2
        expression = {
          $and: [() => false, { $or: [true, false] }],
        };
        expect(await compileAsync(expression)).toEqual(false);

        // scenario 3
        expression = {
          $or: [() => false, false, { $and: [true, true] }],
        };
        expect(await compileAsync(expression)).toEqual(true);

        // scenario 4
        expression = {
          $or: [() => false, false, { $and: [true, false] }],
        };
        expect(await compileAsync(expression)).toEqual(false);

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
        expect(await compileAsync(expression)).toEqual(true);
      });
    });

    describe('AND - OR - fn - callback expressions', () => {
      it('should return expected values ', async () => {
        const options = {
          fns: {
            any: (target, values) => values.includes(target),
            all: (targets, values) =>
              targets.every((target) => values.includes(target)),
            authenticated: (user) =>
              Promise.resolve(['foo', 'bar'].includes(user)),
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
        expect(await compileAsync(expression, options)).toEqual(true);

        // scenario 2
        expression = {
          $and: [
            () => true,
            { $or: [true, false] },
            { any: [5, [1, 3, 4, 6, 7]] },
          ],
        };
        expect(await compileAsync(expression, options)).toEqual(false);

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
        expect(await compileAsync(expression, options)).toEqual(true);

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
        expect(await compileAsync(expression, options)).toEqual(false);

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
        expect(await compileAsync(expression, options)).toEqual(true);

        // scenario 6 - nested promise callback
        expression = {
          $or: [
            () => false,
            false,
            {
              $and: [true, { $and: [() => Promise.resolve(true), true] }],
            },
          ],
        };
        expect(await compileAsync(expression, options)).toEqual(true);
        // sanity check
        expression = {
          $or: [
            () => false,
            false,
            {
              $and: [true, { $and: [() => Promise.resolve(false), true] }],
            },
          ],
        };
        expect(await compileAsync(expression, options)).toEqual(false);

        // scenario 7 - nested promise fn
        expression = {
          $and: [
            () => true,
            true,
            {
              $and: [true, { authenticated: 'bar' }],
            },
          ],
        };
        expect(await compileAsync(expression, options)).toEqual(true);
        // sanity check
        expression = {
          $and: [
            () => true,
            true,
            {
              $and: [true, { authenticated: 'baz' }],
            },
          ],
        };
        expect(await compileAsync(expression, options)).toEqual(false);
      });
    });
  });
});
