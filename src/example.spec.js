const sinon = require('sinon');

const exampleFn = require('./example');

describe('a test example', () => {
    it('should roughly look like this', async () => {
        const expectedValue = new Error('A Test Error');
        const stubFn = sinon.stub().rejects(expectedValue);

        await expect(exampleFn(stubFn)).to.be.rejectedWith(
            expectedValue.message
        );
        expect(stubFn.callCount).to.equal(1);
    });
});
