import compile from '../src';
import { createException } from '../src/utils';

describe('primitive expressions', () => {
  describe('undefined', () => {
    it('should throw', () => {
      expect(() => compile()).toThrow(
        createException(`Expected an expression`),
      );
    });
  });

  describe('boolean', () => {
    it('should return input', () => {
      expect(compile(true)).toEqual(true);
      expect(compile(false)).toEqual(false);
    });
  });

  describe('string', () => {
    it('should throw', () => {
      const expression = 'some string';

      expect(() => compile(expression)).toThrow(
        createException(`Unexpected token '${expression}'`),
      );
    });
  });

  describe('number', () => {
    it('should throw', () => {
      const expression = 201;

      expect(() => compile(expression)).toThrow(
        createException(`Unexpected token '${expression}'`),
      );
    });
  });

  describe('object', () => {
    it('should throw', () => {
      const expression = 201;

      expect(() => compile(expression)).toThrow(
        createException(`Unexpected token '${expression}'`),
      );
    });
  });
});
