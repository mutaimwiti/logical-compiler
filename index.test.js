import {boolEval} from "./index";

describe('evaluate()', function () {

    it('should return false by default', () => {

        expect(boolEval()).toEqual(false);

    });

    describe('callback expressions', () => {
        it('should return correct value', () => {
            let cb = () => true;

            expect(boolEval(cb)).toEqual(true);

            cb = () => false;

            expect(boolEval(cb)).toEqual(false);
        });
    });

    describe('AND expression', () => {
        it('should return correct value for simple booleans', () => {
            let expression = {$and: [true, true]}
            expect(boolEval(expression)).toEqual(true);

            expression = {$and: [true, false]}
            expect(boolEval(expression)).toEqual(false);

            expression = {$and: [false, true]}
            expect(boolEval(expression)).toEqual(false);

            expression = {$and: [false, false]}
            expect(boolEval(expression)).toEqual(false);
        });
    });


    describe('OR expression', () => {
        it('should return correct value for simple booleans', () => {
            let expression = {$or: [true, true]}
            expect(boolEval(expression)).toEqual(true);

            expression = {$or: [true, false]}
            expect(boolEval(expression)).toEqual(true);

            expression = {$or: [false, true]}
            expect(boolEval(expression)).toEqual(true);

            expression = {$or: [false, false]}
            expect(boolEval(expression)).toEqual(false);
        });
    });

    describe('compound expression', () => {
        it('should return correct values ', () => {
            // OR - callback
            // scenario 1
            let expression = {$or: [() => true, true]}
            expect(boolEval(expression)).toEqual(true);

            // scenario 2
            expression = {$or: [true, () => false]}
            expect(boolEval(expression)).toEqual(true);

            // scenario 3
            expression = {$or: [() => false, () => true]}
            expect(boolEval(expression)).toEqual(true);

            // scenario 4
            expression = {$or: [() => false, () => false]}
            expect(boolEval(expression)).toEqual(false);

            // AND - callback
            // scenario 1
            expression = {$and: [() => true, true]}
            expect(boolEval(expression)).toEqual(true);

            // scenario 2
            expression = {$and: [true, () => false]}
            expect(boolEval(expression)).toEqual(false);

            // scenario 3
            expression = {$and: [() => false, () => true]}
            expect(boolEval(expression)).toEqual(false);

            // scenario 4
            expression = {$and: [() => false, () => false]}
            expect(boolEval(expression)).toEqual(false);

            // AND - OR - callback
            // scenario 1
            expression = {
                $and: [
                    () => true,
                    {$or: [false, () => true]}
                ]
            }
            expect(boolEval(expression)).toEqual(true);

            // scenario 2
            expression = {
                $and: [
                    () => false,
                    {$or: [true, false]}
                ]
            }
            expect(boolEval(expression)).toEqual(false);

            // scenario 3
            expression = {
                $or: [
                    () => false,
                    false,
                    {$and: [true, true]}
                ]
            }
            expect(boolEval(expression)).toEqual(true);

            // scenario 4
            expression = {
                $or: [
                    () => false,
                    false,
                    {$and: [true, false]}
                ]
            }
            expect(boolEval(expression)).toEqual(false);

            // scenario 5
            expression = {
                $or: [
                    () => false,
                    false,
                    {
                        $and: [
                            true,
                            {
                                $or: [() => true, false]
                            }
                        ]
                    }
                ]
            }
            expect(boolEval(expression)).toEqual(true);
        });
    });
});
