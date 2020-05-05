const { expect } = require('chai');
const express = require('express');
const request = require('supertest');
const sinon = require('sinon');

const createEndpoints = require('./createEndpoints');
const { query } = require('./db/query');
const findBalance = require('./db/findBalance');
const insertCredits = require('./db/insertCredits');
const validateRows = require('./lib/validateRows');

const makeApp = (overwriteDeps = {}) => {
    const app = express();
    const defaultDeps = {
        handleHealth: sinon.spy(),
        handleReadiness: sinon.spy(),
        handleCredits: sinon.spy(),
        handleBalance: sinon.spy(),
        logger: 'any-logger-object',
        serverState: 'any-server-state',
        app,
    };
    const deps = { ...defaultDeps, ...overwriteDeps };

    createEndpoints(deps);
    app.use((err, req, res, next) => res.status(210).send());

    return app;
};

const createHandlerStub = () => sinon.stub().throws();

describe('createEndpoints', () => {
    it('should return 404 for unknown paths', async () => {
        const res = await request(makeApp()).get('/anything');

        expect(res.status).to.equal(404);
    });

    it('should setup /_health endpoint', async () => {
        const handleHealth = createHandlerStub();
        await request(makeApp({ handleHealth })).get('/_health');

        expect(handleHealth).to.have.been.calledOnce;
    });

    it('should setup /_readiness endpoint', async () => {
        const handleReadiness = createHandlerStub();
        await request(makeApp({ handleReadiness })).get('/_readiness');

        expect(handleReadiness).to.have.been.calledOnce;
        expect(handleReadiness.firstCall.args[0]).to.deep.equal({
            query,
            serverState: 'any-server-state',
        });
    });

    it('should setup /credits endpoint', async () => {
        const handleCredits = createHandlerStub();
        await request(makeApp({ handleCredits })).post(
            '/credits/any-tour-operator-uuid'
        );

        expect(handleCredits).to.have.been.calledOnce;
        expect(handleCredits.firstCall.args[0]).to.deep.equal({
            insertCredits,
            validateRows,
            logger: 'any-logger-object',
        });
    });

    it('should setup /balance endpoint', async () => {
        const handleBalance = createHandlerStub();
        await request(makeApp({ handleBalance })).get('/balance');

        expect(handleBalance).to.have.been.calledOnce;
        expect(handleBalance.firstCall.args[0]).to.deep.equal({
            findBalance,
            logger: 'any-logger-object',
        });
    });
});
