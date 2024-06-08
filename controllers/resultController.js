const pool = require('../src/databasepool').pool;
const Calculator = require('../models/calculator');

// Get leaderboard data
exports.getLeaderboard = async (req, res) => {
    try {
        const season = req.query.season;

        let query;
        let queryParams;

        if (season) {
            query = `
                SELECT
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    tulemus.vanusegrupp,
                    tulemus.hooaeg,
                    SUM(tulemus.punktid) AS punktid_sum
                FROM
                    edetabel
                        JOIN
                    sportlane ON edetabel.sportlane_id = sportlane.id
                        JOIN
                    tulemus ON edetabel.sportlane_id = tulemus.sportlane_id
                WHERE
                    tulemus.hooaeg = ?
                GROUP BY
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    edetabel.vanusegrupp,
                    edetabel.hooaeg
                ORDER BY
                    punktid_sum DESC;
            `;
            queryParams = [season];
        } else {
            query = `
                SELECT
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    tulemus.vanusegrupp,
                    tulemus.hooaeg,
                    SUM(tulemus.punktid) AS punktid_sum
                FROM
                    edetabel
                        JOIN
                    sportlane ON edetabel.sportlane_id = sportlane.id
                        JOIN
                    tulemus ON edetabel.sportlane_id = tulemus.sportlane_id
                WHERE
                    tulemus.hooaeg = (SELECT MAX(hooaeg) FROM tulemus)
                GROUP BY
                    sportlane.eesnimi,
                    sportlane.perenimi,
                    sportlane.sugu,
                    edetabel.vanusegrupp,
                    edetabel.hooaeg
                ORDER BY
                    punktid_sum DESC;
            `;
            queryParams = [];
        }

        const results = await pool.query(query, queryParams);
        res.json(results.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};


// Helper function to fetch recent results
const fetchRecentResults = (limit, callback) => {
    const query = `
        SELECT
            tulemus.id,
            sportlane.eesnimi,
            sportlane.perenimi,
            sportlane.sugu,
            tulemus.ala,
            tulemus.vanusegrupp,
            tulemus.meetrid,
            tulemus.punktid,
            tulemus.hooaeg
        FROM
            tulemus
            JOIN sportlane ON tulemus.sportlane_id = sportlane.id
        ORDER BY
            tulemus.id DESC
        LIMIT ?;
    `;
    pool.query(query, [limit], (error, results) => {
        if (error) {
            console.error('Error fetching recent results:', error);
            return callback(error, null);
        }
        callback(null, results);
    });
};

// Get recent results and send as JSON
exports.getRecentResults = (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    fetchRecentResults(limit, (error, results) => {
        if (error) {
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
};

// Use fetchRecentResults for other functionalities if needed, e.g., rendering templates
exports.renderRecentResults = (req, res) => {
    const limit = 10;
    fetchRecentResults(limit, (error, results) => {
        if (error) {
            return res.status(500).send('Internal Server Error');
        }
        res.render('allresults', { recentResults: results });
    });
};

exports.updateResult = (req, res) => {
    const { id } = req.params;
    const { meetrid, sugu, ala } = req.body;

    // Log the received data
    console.log('Received data:', { id, meetrid, sugu, ala });

    if (!id || !meetrid || !sugu || !ala) {
        console.error('Missing fields:', { id, meetrid, sugu, ala });
        return res.status(400).json({ error: 'All fields are required!' });
    }

    try {
        const calculator = new Calculator(sugu, ala, parseFloat(meetrid));
        const punktid = calculator.calculatePoints();

        const query = `
            UPDATE tulemus
            SET meetrid = ?, punktid = ?
            WHERE id = ?;
        `;
        pool.query(query, [meetrid, punktid, id], (error, result) => {
            if (error) {
                console.error('Error updating result:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Result updated successfully!' });
            } else {
                res.status(404).json({ error: 'Result not found!' });
            }
        });
    } catch (error) {
        console.error('Error calculating points:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteResult = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send('Result ID is required!');
    }

    const query = `
        DELETE FROM tulemus
        WHERE id = ?;
    `;
    pool.query(query, [id], (error, result) => {
        if (error) {
            console.error('Error deleting result:', error);
            return res.status(500).send('Internal Server Error');
        }
        if (result.affectedRows > 0) {
            res.status(200).send('Result deleted successfully!');
        } else {
            res.status(404).send('Result not found!');
        }
    });
};
