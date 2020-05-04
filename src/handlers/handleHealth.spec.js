const { expect } = require('chai');
const sinon = require('sinon');

const handleHealth = require('./handleHealth');

const buildStubs = () => {
    const req = {};
    const res = { send: sinon.spy() };
    return { req, res };
};

describe('handleHealth', () => {
    it('should call res.send', () => {
        const { req, res } = buildStubs();
        handleHealth(req, res);

        expect(res.send).to.have.been.calledOnce;
    });
});
