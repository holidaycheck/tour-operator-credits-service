require('dotenv').config();
const bunyan = require('bunyan');
const express = require('express');
const bodyParser = require('body-parser');
require('body-parser-csv')(bodyParser);

const handleHealth = require('./src/handlers/handleHealth');
const handleReadiness = require('./src/handlers/handleReadiness');
const handleBalance = require('./src/handlers/handleBalance');
const handleCredits = require('./src/handlers/handleCredits');

const logger = bunyan.createLogger({
    level: 'info',
    name: `tour-operator-credits-service-log`,
});

const createEndpoints = require('./src/createEndpoints');

const port = 3000;
const app = express();

app.use(
    bodyParser.csv({
        csvParseOptions: {
            fastcsvParams: {},
        },
    })
);

app.enable('trust proxy');

const serverState = {
    readyToReceiveTraffic: true,
};

const server = app.listen(port, () => {
    logger.info(`app is listening on port ${port}`);
});

createEndpoints({
    app,
    serverState,
    logger,
    handleHealth,
    handleReadiness,
    handleBalance,
    handleCredits,
});

app.use((err, req, res, next) => {
    logger.error(err, 'Unexpected error');
    res.status(500).send('Internal Server Error');
});

if (process.env.NODE_ENV === 'production') {
    process.on('SIGTERM', () => {
        const timeForLoadBalancerToReact = 4000;
        const readinessCheckPeriod = 2000;
        const timeToWaitBeforeShutdown =
            4 * readinessCheckPeriod + timeForLoadBalancerToReact;

        logger.info(
            `Waiting ${timeToWaitBeforeShutdown}ms before initialising graceful shutdown...`
        );

        serverState.readyToReceiveTraffic = false;

        setTimeout(async () => {
            logger.info(
                'Waiting to close outstanding connections to shut down gracefully...'
            );

            server.close(() => {
                logger.info('Graceful shutdown completed successfully.');
            });
        }, timeToWaitBeforeShutdown);
    });
    process.on('SIGINT', process.exit);
}
