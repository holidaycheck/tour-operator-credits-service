const validator = require('validator');

const { getConnection } = require('../db/query');

module.exports = ({ insertCredits, validateRows, logger }, req, res) => {
    const body = req.body;
    const tourOperatorId = req.params.tourOperatorId;
    const isValidTourOperatorUUID = validator.isUUID(tourOperatorId);

    if (!isValidTourOperatorUUID) {
        return res
            .status(400)
            .send(`tourOperatorId is not a valid UUID: ${tourOperatorId}`);
    }

    const rows = body.filter((b) => b[0] !== 'email');
    const trimmedEntries = rows.map((row) => row.map((e) => e.trim()));
    const invalidEntry = validateRows(trimmedEntries);

    if (invalidEntry) {
        return res.status(400).send(invalidEntry);
    }

    const credits = trimmedEntries.map(
        ([
            email,
            amount,
            currencyCode,
            code,
            validUntilDate,
            tourOperatorInternalNumber,
        ]) => ({
            email: email.toLowerCase(),
            amount,
            currencyCode,
            code,
            validUntilDate,
            tourOperatorInternalNumber,
            tourOperatorId,
        })
    );

    return insertCredits({ logger, getConnection }, credits).then(() =>
        res.status(201).send('Credits created')
    );
};
