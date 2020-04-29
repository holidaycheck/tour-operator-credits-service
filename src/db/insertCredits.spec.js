const sinon = require('sinon');
const { Writable } = require('stream');

const insertCredits = require('./insertCredits');

const createMockStream = () => {
    const stream = new Writable();
    stream._write = (chunk, en, cb) => cb();

    return stream;
};

const credits = [
    {
        tourOperatorId: 'some-tour-operator-id',
        email: 'test@email.com',
        amount: 22,
        currencyCode: 'EUR',
        code: 'some-code-1',
        validUntilDate: 'some-date',
        tourOperatorInternalNumber: 'some-number',
    },
    {
        tourOperatorId: 'some-tour-operator-id',
        email: null,
        amount: 22,
        currencyCode: 'EUR',
        code: null,
        validUntilDate: null,
        tourOperatorInternalNumber: 'some-number',
    },
];

describe('insertCredits', () => {
    const createDependencies = (
        stream = createMockStream(),
        release = () => {}
    ) => ({
        getConnection: sinon.stub().returns({
            query: () => stream,
            release,
        }),
        logger: {
            info: sinon.spy(),
            error: sinon.spy(),
            debug: () => {},
        },
        Readable: require('stream').Readable,
    });

    it('should release connection after reading all data from credits', async () => {
        const releaseConnection = sinon.spy();
        const dependencies = createDependencies(undefined, releaseConnection);
        await insertCredits(dependencies, credits);

        expect(releaseConnection.callCount).to.equal(1);
        expect(dependencies.logger.info.callCount).to.equal(3);
        expect(dependencies.logger.error.callCount).to.equal(0);
    });

    it("should pipe the credits in csv format to the query's writable stream", async () => {
        let currentLine = 0;
        const expectedLines = [
            'some-tour-operator-id,test@email.com,22,EUR,some-code-1,some-date,some-number\n',
            'some-tour-operator-id,null,22,EUR,null,null,some-number\n',
        ];
        const queryStream = createMockStream();
        queryStream._write = (chunk, en, cb) => {
            expect(chunk.toString()).to.equal(expectedLines[currentLine]);
            currentLine++;
            cb();
        };
        await insertCredits(createDependencies(queryStream), credits);

        expect(currentLine).to.equal(2);
    });

    it('should release the connection if an error occurs when executing the query', async () => {
        const mockError = new Error('a-test-error');
        const releaseConnection = sinon.spy();
        const queryStream = createMockStream();
        queryStream._write = () => {
            queryStream.emit('error', mockError);
        };
        const dependencies = createDependencies(queryStream, releaseConnection);
        const result = insertCredits(dependencies, credits);

        await expect(result).to.be.rejectedWith(mockError.message);
        expect(releaseConnection.callCount).to.equal(1);
        expect(dependencies.logger.info.callCount).to.equal(2);
        expect(dependencies.logger.error.callCount).to.equal(1);
        expect(dependencies.logger.error).to.have.been.calledWithExactly(
            'Error inserting credits: ',
            mockError
        );
    });
});
