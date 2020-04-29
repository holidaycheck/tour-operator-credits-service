module.exports = async ({ query }, tourOperatorId, email, code) => {
    const result = await query(
        `
    SELECT
        id,
        amount,
        currencyCode as "currencyCode"
    FROM credits
    WHERE
        tourOperatorId = $1
        AND email = $2
        AND code ${code ? '= $3' : 'IS NULL'}
        AND (validUntilDate IS NULL OR validUntilDate >= CURRENT_DATE)
    ORDER BY
        entryDate DESC
    LIMIT 1`,
        [tourOperatorId, email.toLowerCase(), code].filter(Boolean)
    );

    return result.rows[0];
};
