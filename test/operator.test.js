import compile from '../src';
import { createException } from '../src/utils';

describe('operator expressions', () => {
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

  describe('empty operand arrays', () => {
    it('$and of [] should be true (vacuous truth)', () => {
      expect(compile({ $and: [] })).toEqual(true);
    });

    it('$or of [] should be false', () => {
      expect(compile({ $or: [] })).toEqual(false);
    });
  });

  describe('unrecognized operator', () => {
    it('should throw', () => {
      const expression = { $someOp: ['x', 'y'] };

      expect(() => compile(expression)).toThrow(
        createException(`Unrecognized operator: '$someOp'`),
      );
    });
  });
});
