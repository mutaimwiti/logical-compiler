import boolExec from './index';

describe('boolExec()', function () {
  it('should return false by default', () => {
    expect(boolExec()).toEqual(false);
  });

  describe('callback expressions', () => {
    it('should return expected value', () => {
      let cb = () => true;

      expect(boolExec(cb)).toEqual(true);

      cb = () => false;

      expect(boolExec(cb)).toEqual(false);
    });
  });

  describe('AND expressions', () => {
    it('should return expected value', () => {
      let expression = { $and: [true, true] };
      expect(boolExec(expression)).toEqual(true);

      expression = { $and: [true, false] };
      expect(boolExec(expression)).toEqual(false);

      expression = { $and: [false, true] };
      expect(boolExec(expression)).toEqual(false);

      expression = { $and: [false, false] };
      expect(boolExec(expression)).toEqual(false);
    });
  });

  describe('OR expressions', () => {
    it('should return expected value', () => {
      let expression = { $or: [true, true] };
      expect(boolExec(expression)).toEqual(true);

      expression = { $or: [true, false] };
      expect(boolExec(expression)).toEqual(true);

      expression = { $or: [false, true] };
      expect(boolExec(expression)).toEqual(true);

      expression = { $or: [false, false] };
      expect(boolExec(expression)).toEqual(false);
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
      expect(boolExec(expression, options)).toEqual(false);

      expression = { isEven: 6 };
      expect(boolExec(expression, options)).toEqual(true);
    });
  });

  describe('compound expressions', () => {
    describe('AND - OR expressions', () => {
      it('should return expected value ', () => {
        // scenario 1
        let expression = {
          $or: [{ $and: [true, true] }, false],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 2
        expression = {
          $or: [{ $and: [true, false] }, false],
        };
        expect(boolExec(expression)).toEqual(false);

        // scenario 3
        expression = {
          $and: [true, { $or: [false, true] }],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 4
        expression = {
          $and: [false, { $or: [false, true] }],
        };
        expect(boolExec(expression)).toEqual(false);
      });
    });

    describe('OR - callback expressions', () => {
      it('should return expected values ', () => {
        let expression = {
          $or: [() => true, true],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 2
        expression = {
          $or: [true, () => false],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 3
        expression = {
          $or: [() => false, () => true],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 4
        expression = {
          $or: [() => false, () => false],
        };
        expect(boolExec(expression)).toEqual(false);
      });
    });

    describe('AND - callback expressions', () => {
      it('should return expected values ', () => {
        let expression = {
          $and: [() => true, true],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 2
        expression = {
          $and: [true, () => false],
        };
        expect(boolExec(expression)).toEqual(false);

        // scenario 3
        expression = {
          $and: [() => false, () => true],
        };
        expect(boolExec(expression)).toEqual(false);

        // scenario 4
        expression = {
          $and: [() => false, () => false],
        };
        expect(boolExec(expression)).toEqual(false);
      });
    });

    describe('AND - OR - callback expressions', () => {
      it('should return expected values ', () => {
        // scenario 1
        let expression = {
          $and: [() => true, { $or: [false, () => true] }],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 2
        expression = {
          $and: [() => false, { $or: [true, false] }],
        };
        expect(boolExec(expression)).toEqual(false);

        // scenario 3
        expression = {
          $or: [() => false, false, { $and: [true, true] }],
        };
        expect(boolExec(expression)).toEqual(true);

        // scenario 4
        expression = {
          $or: [() => false, false, { $and: [true, false] }],
        };
        expect(boolExec(expression)).toEqual(false);

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
        expect(boolExec(expression)).toEqual(true);
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
        expect(boolExec(expression, options)).toEqual(true);

        // scenario 2
        expression = {
          $and: [
            () => true,
            { $or: [true, false] },
            { any: [5, [1, 3, 4, 6, 7]] },
          ],
        };
        expect(boolExec(expression, options)).toEqual(false);

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
        expect(boolExec(expression, options)).toEqual(true);

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
        expect(boolExec(expression, options)).toEqual(false);

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
        expect(boolExec(expression, options)).toEqual(true);
      });
    });
  });
});
