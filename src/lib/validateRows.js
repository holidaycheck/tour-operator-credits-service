const validator = require('validator');

const EXPECTED_COLUMNS = 6;

const validateRows = (rows) => {
    const validCurrencyCodes = ['EUR', 'CHF'];
    const validators = [
        { column: 'email', validate: validator.isEmail },
        { column: 'amount', validate: validator.isDecimal },
        {
            column: 'currencyCode',
            validate: (e) => validCurrencyCodes.includes(e),
        },
        {
            column: 'validUntilDate',
            validate: (e) => (e ? validator.isISO8601(e) : true),
        },
    ];

    let invalidRow = null;

    rows.every((row, i) => {
        const containsExpectedColumnsInARow = row.length === EXPECTED_COLUMNS;
        const currentRow = `${i + 1} or ${i + 2} (with header)`;

        if (!containsExpectedColumnsInARow) {
            invalidRow = `Does not satisfy the required number of ${EXPECTED_COLUMNS} columns in the row ${currentRow}`;
            return containsExpectedColumnsInARow;
        }

        const [email, amount, currencyCode, , validUntilDate] = row;
        const entriesToBeValidatedInARow = [
            email,
            amount,
            currencyCode,
            validUntilDate,
        ];

        return entriesToBeValidatedInARow.every((e, i) => {
            const isValid = validators[i].validate(e);

            if (!isValid) {
                invalidRow = `Invalid ${validators[i].column} value at row ${currentRow}: ${e}`;
            }

            return isValid;
        });
    });

    return invalidRow;
};

module.exports = validateRows;
