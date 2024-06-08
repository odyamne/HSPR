const Calculator = require('../models/calculator');
const pool = require('../src/databasepool').pool;

// POST tulemuste tabelisse
exports.postPoints = async (req, res) => {
    const { athlete_id, event, best_result, age_group } = req.body;
    const season = new Date().getFullYear(); // automaatne hooaja määramine

    if (!athlete_id || !event || best_result === undefined || !age_group) {
        return res.status(400).send('Täida kõik väljad');
    }

    try {
        // Sportlase soo päring andmebaasist
        const selectSql = 'SELECT sugu FROM sportlane WHERE id = ?';

        pool.getConnection((err, conn) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).send('Internal server error');
            } else {
                conn.execute(selectSql, [athlete_id], (err, result) => {
                    if (err) {
                        conn.release();
                        console.error('Database query error:', err);
                        return res.status(500).send('Internal server error');
                    } else {
                        if (result.length === 0) {
                            conn.release();
                            return res.status(404).send('Athlete not found');
                        }

                        const gender = result[0].sugu;

                        const calculator = new Calculator(gender, event, best_result);

                        const points = calculator.calculatePoints();

                        // Insert tulemuste tabelisse
                        const insertSql = 'INSERT INTO tulemus (sportlane_id, ala, vanusegrupp, meetrid, punktid, hooaeg) VALUES (?, ?, ?, ?, ?, ?)';
                        conn.execute(insertSql, [athlete_id, event, age_group, best_result, points, season], (err) => {
                            conn.release();
                            if (err) {
                                console.error('Database insert error:', err);
                                return res.status(500).send('Internal server error');
                            }
                            res.status(200).end();
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error calculating points:', error);
        res.status(500).send('Internal server error');
    }
};
