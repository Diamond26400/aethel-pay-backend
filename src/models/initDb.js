require('dotenv').config();
const pool = require('../config/db');

const createTables = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            amount INTEGER NOT NULL,
            reference VARCHAR(255) UNIQUE NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        console.log('⏳ Creating tables...');
        await pool.query(queryText);
        console.log('✅ Transactions table created successfully!');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        // Close the database connection when done
        pool.end(); 
    }
};

createTables();