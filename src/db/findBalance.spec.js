const sinon = require('sinon');

const findBalance = require('./findBalance');

describe('findBalance', () => {
    const createDependencies = () => ({
        query: sinon.stub().resolves({ rows: ['some-result'] }),
    });
    const defaultTourOperatorId = 'some-tour-operator-id';
    const defaultEmail = 'some@email.test';
    const defaultCode = 'some-code';

    it('should return the first row of the result set', async () => {
        const result = await findBalance(
            createDependencies(),
            defaultTourOperatorId,
            defaultEmail
        );

        expect(result).to.equal('some-result');
    });

    it('should execute the right query if the payload does not contain a code', async () => {
        const dependencies = createDependencies();
        await findBalance(dependencies, defaultTourOperatorId, defaultEmail);

        expect(dependencies.query.callCount).to.equal(1);
        expect(dependencies.query.firstCall.args[0]).to.include(
            'AND code IS NULL'
        );
        expect(dependencies.query.firstCall.args[1]).to.deep.equal([
            defaultTourOperatorId,
            defaultEmail,
        ]);
    });

    it('should execute the right query if the payload contains a code', async () => {
        const dependencies = createDependencies();
        await findBalance(
            dependencies,
            defaultTourOperatorId,
            defaultEmail,
            defaultCode
        );

        expect(dependencies.query.callCount).to.equal(1);
        expect(dependencies.query.firstCall.args[0]).to.include(
            'AND code = $3'
        );
        expect(dependencies.query.firstCall.args[1]).to.deep.equal([
            defaultTourOperatorId,
            defaultEmail,
            defaultCode,
        ]);
    });
});
