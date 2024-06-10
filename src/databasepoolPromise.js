const mysql = require('mysql2/promise');
const dataBase = 'if23_ander_aa_hspr2';
const dbConfig = require('../../../vp23config'); // Path only works in specific greeny 

const poolPromise = mysql.createPool({
    host: dbConfig.configData.host,
    user: dbConfig.configData.user,
    password: dbConfig.configData.password,
    database: dataBase,
    connectionLimit: 5 
});

// Test the connection to ensure it's working
poolPromise.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Successfully connected to the new database');
    connection.release();
});

module.exports = { pool: poolPromise }; // Export it as 'pool'
