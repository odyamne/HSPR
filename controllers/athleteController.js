const pool = require('../src/databasepool').pool;
const poolPromise = require('../src/databasepoolPromise').pool;

// Function to check if athlete exists and get athlete ID, or create new athlete
exports.getOrCreateAthlete = async (firstName, lastName, gender) => {
    const selectSql = 'SELECT id FROM sportlane WHERE eesnimi = ? AND perenimi = ? AND sugu = ?';
    const insertSql = 'INSERT INTO sportlane (eesnimi, perenimi, sugu) VALUES (?, ?, ?)';
    try {
        const [result] = await poolPromise.query(selectSql, [firstName, lastName, gender]);
        if (result.length > 0) {
            return result[0].id; // Return athlete ID if exists
        } else {
            const [insertResult] = await poolPromise.query(insertSql, [firstName, lastName, gender]);
            return insertResult.insertId; // Return new athlete ID
        }
    } catch (err) {
        console.error('Database error:', err);
        throw new Error('Internal server error');
    }
};

exports.getAthlete = async (req, res) => {
    const { firstName, lastName, gender } = req.query;

    try {
        const athleteId = await exports.getOrCreateAthlete(firstName, lastName, gender);
        res.json({ exists: true, athleteId });
    } catch (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Internal server error');
    }
};

exports.postAthlete = async (req, res) => {
    const { firstName, lastName, gender } = req.body;
    try {
        const athleteId = await exports.getOrCreateAthlete(firstName, lastName, gender);
        res.json({ athleteId });
    } catch (err) {
        console.error('Database insert error:', err);
        return res.status(500).send('Internal server error');
    }
};

exports.getFirstNames = async (req, res) => {
    const { prefix } = req.body;
    const selectSql = 'SELECT eesnimi FROM sportlane WHERE eesnimi LIKE ?';
    try {
        const [result] = await poolPromise.query(selectSql, [`${prefix}%`]);
        res.json(result);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
};

exports.getLastNames = async (req, res) => {
    const { prefix } = req.body;
    const selectSql = 'SELECT perenimi FROM sportlane WHERE perenimi LIKE ?';
    try {
        const [result] = await poolPromise.query(selectSql, [`${prefix}%`]);
        res.json(result);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
};
