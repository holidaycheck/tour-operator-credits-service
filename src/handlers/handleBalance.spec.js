const { expect } = require('chai');
const sinon = require('sinon');

const handleBalance = require('./handleBalance');
const { query } = require('../db/query');

describe('handleBalance', () => {
    const findBalance = sinon.stub();
    const logger = {
        info: sinon.spy(),
    };
    const createRequest = ({
        tourOperatorId = '164cf23f-1508-47a4-ba94-f6239caf7e60',
        email = 'some-email@domain.com',
    }) => ({
        method: 'GET',
        url:
            '/balance?tourOperatorId=some-TO-id&email=some-email@domain.com&code=some-code',
        query: {
            tourOperatorId,
            email,
            code: 'some-code',
        },
    });

    const res = {
        json: sinon.stub(),
    };

    it('should call the logger with the right argument', async () => {
        const req = await createRequest({});
        await handleBalance({ findBalance, logger }, req, res);

        expect(logger.info).to.have.been.calledWith(
            'GET /balance?tourOperatorId=some-TO-id&email=some-email@domain.com&code=some-code'
        );
    });

    describe('defaultValue:', () => {
        it('should be returned, if there is no touroperatorId provided in the query', async () => {
            const req = createRequest({ tourOperatorId: undefined });
            await handleBalance({ findBalance, logger }, req, res);
            const expectedDefaultValue = { amount: 0, currencyCode: 'EUR' };

            expect(res.json).to.have.been.calledWith(expectedDefaultValue);
        });

        it('should be returned, if the provided touroperatorId is not a valid UUID', async () => {
            const req = createRequest({ tourOperatorId: 'some-id' });
            await handleBalance({ findBalance, logger }, req, res);
            const expectedDefaultValue = { amount: 0, currencyCode: 'EUR' };

            expect(res.json).to.have.been.calledWith(expectedDefaultValue);
        });

        it('should be returned, if there is no email provided in the query', async () => {
            const req = createRequest({ email: '' });
            await handleBalance({ findBalance, logger }, req, res);
            const expectedDefaultValue = { amount: 0, currencyCode: 'EUR' };

            expect(res.json).to.have.been.calledWith(expectedDefaultValue);
        });

        it('should be returned, if the findBalance returns an empty result', async () => {
            const req = createRequest({});
            const { tourOperatorId, email, code } = req.query;
            findBalance.resolves(undefined);
            await handleBalance({ findBalance, logger }, req, res);
            const expectedDefaultValue = { amount: 0, currencyCode: 'EUR' };

            expect(findBalance).to.have.been.calledWith(
                { query },
                tourOperatorId,
                email,
                code
            );
            expect(res.json).to.have.been.calledWith(expectedDefaultValue);
        });
    });

    it('should call findBalance and return the result, if the expected query params are provided', async () => {
        const req = createRequest({});
        const { tourOperatorId, email, code } = req.query;
        findBalance.resolves({ amount: 10, currencyCode: 'CHF' });
        await handleBalance({ findBalance, logger }, req, res);
        const expectedValue = { amount: 10, currencyCode: 'CHF' };

        expect(findBalance).to.have.been.calledWith(
            { query },
            tourOperatorId,
            email,
            code
        );
        expect(res.json).to.have.been.calledWith(expectedValue);
    });
});
