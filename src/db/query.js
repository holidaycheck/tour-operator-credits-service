const { Pool, defaults } = require('pg');

defaults.parseInt8 = true;
const pool = new Pool();

const query = (text, params) => {
    return pool.query(text, params);
};

const getConnection = () => pool.connect();

module.exports = {
    query,
    getConnection,
};
