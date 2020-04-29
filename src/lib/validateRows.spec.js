const validateRows = require('./validateRows');

const buildRow = ({
    email = 'urlauber@aol.com',
    amount = '233.12',
    currencyCode = 'EUR',
    code = 'COR-12553',
    validUntilDate = '2021-12-31',
    tourOperatorInternalNumber = '930906391',
} = {}) => [
    email,
    amount,
    currencyCode,
    code,
    validUntilDate,
    tourOperatorInternalNumber,
];

const checkAcceptance = (name, value) => {
    expect(validateRows([buildRow({ [name]: value })])).null;
};

const checkRejection = (name, value) => {
    expect(validateRows([buildRow({ [name]: value })])).string(value);
};

describe('validateRows', () => {
    it('should reject with an readable error message when a field is invalid', () => {
        const email = 'broken email';
        expect(validateRows([buildRow({ email })])).equal(
            `Invalid email value at row 1 or 2 (with header): ${email}`
        );
    });

    it('should validate every row', () => {
        const email = 'broken email';
        expect(validateRows([buildRow(), buildRow({ email })])).equal(
            `Invalid email value at row 2 or 3 (with header): ${email}`
        );
    });

    it('should reject wrong amount of columns', () => {
        expect(validateRows([[]])).equal(
            'Does not satisfy the required number of 6 columns in the row 1 or 2 (with header)'
        );
    });

    describe('email', () => {
        it('should reject an invalid email address', () => {
            checkRejection('email', 'broken email');
        });

        it('should accept a valid email address', () => {
            checkAcceptance('email', 'email@example.com');
        });
    });

    describe('amount', () => {
        it('should reject a non decimal amount', () => {
            checkRejection('amount', '2,43');
        });

        it('should accept decimal amount', () => {
            checkAcceptance('amount', '2.43');
        });

        it('should accept amount without decimal point', () => {
            checkAcceptance('amount', '2');
        });
    });

    describe('currencyCode', () => {
        it('should reject an unknown currency code', () => {
            checkRejection('currencyCode', 'USD');
        });

        it('should accept Euro', () => {
            checkAcceptance('currencyCode', 'EUR');
        });

        it('should accept Swiss francs', () => {
            checkAcceptance('currencyCode', 'CHF');
        });
    });

    describe('code', () => {
        it('should accept any kind of string', () => {
            checkAcceptance('code', 'any thing');
        });

        it('should accept a missing code', () => {
            checkAcceptance('code', '');
        });
    });

    describe('validUntilDate', () => {
        it('should reject a non iso date', () => {
            checkRejection('validUntilDate', '31.12.2021');
        });

        it('should accept an iso date', () => {
            checkAcceptance('validUntilDate', '2021-12-31');
        });
    });

    describe('tourOperatorInternalNumber', () => {
        it('should accept any kind of string', () => {
            checkAcceptance('tourOperatorInternalNumber', 'any thing');
        });

        it('should accept a missing internal number', () => {
            checkAcceptance('tourOperatorInternalNumber', '');
        });
    });
});
