const isUuid = require('uuid-validate');

const { query } = require('../db/query');

module.exports = async ({ findBalance, logger }, req, res) => {
    logger.info(`${req.method} ${req.url}`);

    const defaultValue = { amount: 0, currencyCode: 'EUR' };

    const { tourOperatorId, email, code } = req.query;

    if (!(tourOperatorId && isUuid(tourOperatorId) && email)) {
        return res.json(defaultValue);
    }

    const result = await findBalance({ query }, tourOperatorId, email, code);

    if (!result) {
        return res.json(defaultValue);
    }

    res.json({
        amount: parseFloat(result.amount),
        currencyCode: result.currencyCode,
    });
};
