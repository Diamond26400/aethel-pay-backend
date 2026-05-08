const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Change this from the previous object to simply 'false'
});

pool.connect()
    .then(() => console.log('📦 Successfully connected to Railway PostgreSQL'))
    .catch(err => console.error('Database connection error:', err.stack));

module.exports = pool;