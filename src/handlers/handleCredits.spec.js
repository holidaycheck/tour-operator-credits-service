const { expect } = require('chai');
const sinon = require('sinon');

const handleCredits = require('./handleCredits');
const { getConnection } = require('../db/query');

describe('handleCredits', () => {
    const insertCredits = sinon.stub().resolves('Success');
    const validateRows = sinon.stub();
    const logger = {};
    const createRequest = (
        tourOperatorId = '164cf23f-1508-47a4-ba94-f6239caf7e60'
    ) => ({
        body: [
            [
                'email',
                'amount',
                'currencyCode',
                'code',
                'validUntilDate',
                'tourOperatorInternalNumber',
            ],
            [
                'some-Email@domain.com',
                '1000 ',
                'CHF ',
                'some-code ',
                '2020-10-01',
                'some-internal-number',
            ],
        ],
        params: {
            tourOperatorId,
        },
    });

    const res = {
        status: sinon.stub().returns({ send: sinon.spy() }),
    };

    describe('Bad request:', () => {
        it('should be responded, if the tourOperatorId is not a valid UUID', async () => {
            const req = createRequest('some-id');
            await handleCredits(
                { insertCredits, validateRows, logger },
                req,
                res
            );

            expect(res.status).to.have.been.calledWith(400);
            expect(res.status().send).to.have.been.calledWith(
                'tourOperatorId is not a valid UUID: some-id'
            );
        });

        it('should be responded, if the validation fails', async () => {
            validateRows.returns('Some invalid entry');
            const req = createRequest();
            await handleCredits(
                { insertCredits, validateRows, logger },
                req,
                res
            );

            expect(res.status).to.have.been.calledWith(400);
            expect(res.status().send).to.have.been.calledWith(
                'Some invalid entry'
            );
        });
    });

    it('should call the insertCredits with the right arguments', async () => {
        validateRows.returns('');
        const req = createRequest();
        await handleCredits({ insertCredits, validateRows, logger }, req, res);
        const expectedCredits = [
            {
                email: 'some-email@domain.com',
                amount: '1000',
                currencyCode: 'CHF',
                code: 'some-code',
                validUntilDate: '2020-10-01',
                tourOperatorInternalNumber: 'some-internal-number',
                tourOperatorId: '164cf23f-1508-47a4-ba94-f6239caf7e60',
            },
        ];

        expect(insertCredits).to.have.been.calledWith(
            { logger, getConnection },
            expectedCredits
        );
        expect(res.status).to.have.been.calledWith(201);
        expect(res.status().send).to.have.been.calledWith('Credits created');
    });
});
