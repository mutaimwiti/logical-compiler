import {boolEval} from "./index";

describe('boolEval()', function () {

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

    describe('fn expression', () => {
        it('should return correct value', () => {
            const options = {
                fns: {
                    isEven: number => number % 2 === 0
                }
            };

            let expression = {isEven: 7};
            expect(boolEval(expression, options)).toEqual(false);

            expression = {isEven: 6};
            expect(boolEval(expression, options)).toEqual(true);
        });
    });

    describe('compound expression', () => {
        describe('AND - OR expression', () => {
            it('should return correct values ', () => {
                // scenario 1
                let expression = {
                    $or: [
                        {$and: [true, true]},
                        false
                    ]
                };
                expect(boolEval(expression)).toEqual(true);

                // scenario 2
                expression = {
                    $or: [
                        {$and: [true, false]},
                        false
                    ]
                };
                expect(boolEval(expression)).toEqual(false);

                // scenario 3
                expression = {
                    $and: [
                        true,
                        {$or: [false, true]}
                    ]
                }
                expect(boolEval(expression)).toEqual(true);

                // scenario 4
                expression = {
                    $and: [
                        false,
                        {$or: [false, true]}
                    ]
                }
                expect(boolEval(expression)).toEqual(false);
            });
        });

        describe('OR - callback expression', () => {
            it('should return correct values ', () => {
                let expression = {
                    $or: [() => true, true]
                }
                expect(boolEval(expression)).toEqual(true);

                // scenario 2
                expression = {
                    $or: [true, () => false]
                }
                expect(boolEval(expression)).toEqual(true);

                // scenario 3
                expression = {
                    $or: [() => false, () => true]
                }
                expect(boolEval(expression)).toEqual(true);

                // scenario 4
                expression = {
                    $or: [() => false, () => false]
                }
                expect(boolEval(expression)).toEqual(false);
            });
        });

        describe('AND - callback expression', () => {
            it('should return correct values ', () => {
                let expression = {
                    $and: [() => true, true]
                }
                expect(boolEval(expression)).toEqual(true);

                // scenario 2
                expression = {
                    $and: [true, () => false]
                }
                expect(boolEval(expression)).toEqual(false);

                // scenario 3
                expression = {
                    $and: [() => false, () => true]
                }
                expect(boolEval(expression)).toEqual(false);

                // scenario 4
                expression = {
                    $and: [() => false, () => false]
                }
                expect(boolEval(expression)).toEqual(false);
            });
        });

        describe('AND - OR - callback expression', () => {
            it('should return correct values ', () => {
                // scenario 1
                let expression = {
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

        describe('AND - OR - fn - callback expression', () => {
            it('should return correct values ', () => {
                const options = {
                    fns: {
                        any: (target, values) => values.includes(target),
                        all: (targets, values) => targets.every(target => values.includes(target)),
                    }
                }
                // scenario 1
                let expression = {
                    $and: [
                        () => true,
                        {$or: [false, () => true]},
                        {any: [5, [1, 3, 4, 5, 6]]}
                    ]
                }
                expect(boolEval(expression, options)).toEqual(true);

                // scenario 2
                expression = {
                    $and: [
                        () => true,
                        {$or: [true, false]},
                        {any: [5, [1, 3, 4, 6, 7]]}
                    ]
                }
                expect(boolEval(expression, options)).toEqual(false);

                // scenario 3
                expression = {
                    $or: [
                        () => false,
                        false,
                        {$and: [true, false]},
                        {all: [[3, 4, 7], [2, 3, 4, 5, 6, 7]]}
                    ]
                }
                expect(boolEval(expression, options)).toEqual(true);

                // scenario 4
                expression = {
                    $or: [
                        () => false,
                        false,
                        {$and: [true, false]},
                        {all: [[3, 7, 9], [2, 3, 4, 5, 6]]}
                    ]
                }
                expect(boolEval(expression, options)).toEqual(false);

                // scenario 5
                expression = {
                    $or: [
                        () => false,
                        false,
                        {
                            $and: [
                                true,
                                {
                                    $and: [
                                        true,
                                        () => true,
                                        {any: [2, [5, 2, 3, 4]]},
                                    ]
                                }
                            ]
                        }
                    ]
                }
                expect(boolEval(expression, options)).toEqual(true);
            });
        });

    });
});
