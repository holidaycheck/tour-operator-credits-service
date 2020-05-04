const { expect } = require('chai');
const sinon = require('sinon');

const handleReadiness = require('./handleReadiness');

describe('handleReadiness', () => {
    const createServerState = (isReady) => ({
        readyToReceiveTraffic: isReady,
    });
    const req = {};
    const res = {
        send: sinon.spy(),
        status: sinon.stub().returns({ send: sinon.spy() }),
    };

    it('should respond with count of the table, if the serverState and database is ready', async () => {
        const query = sinon
            .stub()
            .resolves({ rows: [{ numberOfCredits: 10 }] });
        const serverState = createServerState(true);
        await handleReadiness({ serverState, query }, req, res);

        expect(query).to.have.been.calledWith(
            'SELECT COUNT(*) as "numberOfCredits" FROM credits'
        );
        expect(res.send).to.have.been.calledWith(
            'Ready: 10 credits in database'
        );
    });

    it('should respond with 503, if the serverState is not ready', async () => {
        const query = sinon.stub();
        const serverState = createServerState(false);
        await handleReadiness({ serverState, query }, req, res);

        expect(query).not.to.have.been.called;
        expect(res.status).to.have.been.calledWith(503);
        expect(res.status().send).to.have.been.calledWith(
            'Service Unavailable'
        );
    });
});
