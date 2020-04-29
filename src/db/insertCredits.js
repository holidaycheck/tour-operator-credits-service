const { Readable } = require('stream');
const copyFrom = require('pg-copy-streams').from;

const columnDelimiter = ',';

const formatColumn = (value, delimiter = columnDelimiter) => value + delimiter;

const createReadLine = ({ logger }, rs, credits) => {
    let currentIndex = 0;

    return () => {
        if (currentIndex === credits.length) {
            logger.info('finished reading credits');
            rs.push(null);
        } else {
            const credit = credits[currentIndex];
            const line =
                formatColumn(credit.tourOperatorId) +
                formatColumn(credit.email) +
                formatColumn(credit.amount) +
                formatColumn(credit.currencyCode) +
                formatColumn(credit.code) +
                formatColumn(credit.validUntilDate) +
                formatColumn(credit.tourOperatorInternalNumber, '\n');
            rs.push(line);
            logger.debug(line);

            currentIndex++;
        }
    };
};

module.exports = async ({ getConnection, logger }, credits) => {
    const connection = await getConnection();
    const done = () => {
        logger.info('release connection');
        connection.release();
    };

    return new Promise((resolve, reject) => {
        const stream = connection.query(
            copyFrom(`
            COPY credits (
                tourOperatorId,
                email,
                amount,
                currencyCode,
                code,
                validUntilDate,
                tourOperatorInternalNumber
            ) FROM STDIN CSV`)
        );

        const rs = new Readable();

        rs._read = createReadLine({ logger }, rs, credits);

        const onError = (err) => {
            logger.error('Error inserting credits: ', err);
            done();
            reject(err);
        };

        rs.on('error', onError);
        stream.on('error', onError);
        stream.on('finish', () => {
            logger.info('Inserted credits.');
            done();
            resolve();
        });
        rs.pipe(stream);
    });
};
