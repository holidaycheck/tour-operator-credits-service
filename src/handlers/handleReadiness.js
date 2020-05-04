module.exports = async ({ serverState, query }, req, res) => {
    if (serverState.readyToReceiveTraffic) {
        const result = await query(
            'SELECT COUNT(*) as "numberOfCredits" FROM credits'
        );
        return res.send(
            `Ready: ${result.rows[0].numberOfCredits} credits in database`
        );
    }

    res.status(503).send('Service Unavailable');
};
