const asyncHandler = require('express-async-handler');
const { static } = require('express');

const { query } = require('./db/query');
const findBalance = require('./db/findBalance');
const insertCredits = require('./db/insertCredits');
const validateRows = require('./lib/validateRows');

module.exports = ({
    app,
    serverState,
    logger,
    handleHealth,
    handleReadiness,
    handleBalance,
    handleCredits,
}) => {
    app.get('/_health', asyncHandler(handleHealth));
    app.get(
        '/_readiness',
        asyncHandler(handleReadiness.bind(null, { serverState, query }))
    );
    app.get(
        '/balance',
        asyncHandler(handleBalance.bind(null, { findBalance, logger }))
    );
    app.post(
        '/credits/:tourOperatorId',
        asyncHandler(
            handleCredits.bind(null, { insertCredits, validateRows, logger })
        )
    );
    app.use(
        '/credits/:tourOperatorId/upload',
        static('public/creditsUploadPage')
    );
};
