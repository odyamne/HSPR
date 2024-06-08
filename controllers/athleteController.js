const Athlete = require('../models/athlete');
const pool = require('../src/databasepool').pool;


// Controller function to get an athlete
exports.getAthlete = (req, res) => {
    const { firstName, lastName, gender } = req.query;

    const selectSql = 'SELECT id FROM sportlane WHERE eesnimi = ? AND perenimi = ? AND sugu = ?';

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).send('Internal server error');
        }

        conn.execute(selectSql, [firstName, lastName, gender], (err, result) => {
            conn.release();
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Internal server error');
            }

            if (result.length > 0) {
                return res.json({ exists: true, athleteId: result[0].id });
            } else {
                return res.json({ exists: false });
            }
        });
    });
};

// Controller function to create an athlete
exports.postAthlete = (req, res) => {
    const { firstName, lastName, gender } = req.body;
    checkName(firstName);
    checkName(lastName);
    const insertSql = 'INSERT INTO sportlane (eesnimi, perenimi, sugu) VALUES (?, ?, ?)';
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).send('Internal server error');
        }

        conn.execute(insertSql, [firstName, lastName, gender], (err, result) => {
            conn.release();
            if (err) {
                console.error('Database insert error:', err);
                return res.status(500).send('Internal server error');
            }

            return res.json({ athleteId: result.insertId });
        });
    });
};


// exports.createAthlete = async (req, res) => {
//     const { firstName, lastName, gender } = req.body;
//
//     try {
//
//         checkName(firstName);
//         checkName(lastName);
//
//         pool.getConnection((err, conn) => {
//             if (err) {
//                 console.error('Database query error:', err);
//                 return res.status(500).send('Internal server error');
//             } else {
//                 const selectSql = 'SELECT id FROM sportlane WHERE eesnimi = ? AND perenimi = ? AND sugu = ?';
//
//                 conn.execute(selectSql, [firstName, lastName, gender], (err, result) => {
//                     if (err) {
//                         console.error('Database query error:', err);
//                         return res.status(500).send('Internal server error');
//                     } else {
//                         if (result.length > 0) {
//                             return res.status(200).json({exists: true, athleteId: result[0].id});
//                         } else {
//                             const insertSql = 'INSERT INTO sportlane (eesnimi, perenimi, sugu) VALUES (?, ?, ?)';
//
//                             conn.execute(insertSql, [firstName, lastName, gender], (err, result) => {
//                                 conn.release();
//                                 if (err) {
//                                     console.error('Database query error:', err);
//                                     return res.status(500).send('Internal server error');
//                                 }
//                                 res.status(200).end();
//                             })
//                         }
//                     }
//                 })
//             }
//         })
//     } catch (error) {
//         console.error('Error:', error.message);
//         if (error.message === "Lahter on tühi!" || error.message === "Lahtris on keelatud tähemärgid!") {
//             res.status(400).send(error.message); // Validation error
//         } else {
//             res.status(500).send('Internal Server Error'); // Other errors
//         }
//     }
// };

function checkName(competitorsName) {
    const forbiddenChars = /[:;?\=\(\)\[\]{}<>'"/\\!@#$%^&*_+`|~0-9]/; // ei tea mis värk nende kaldkriipsudega on (võetud gevini koodist)
    if (competitorsName == null || competitorsName === "") {
        throw new Error("Lahter on tühi!");
    } else if (competitorsName.match(forbiddenChars)) {
        throw new Error("Lahtris on keelatud tähemärgid!");
    }
}


exports.getFirstNames = async (req, res) => {
    const { prefix } = req.body;

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error');
        } else {
            const selectSql = 'SELECT eesnimi FROM spotlane';
            const values = [`${prefix}%`]

            conn.execute(selectSql, values, (err, result) => {
                conn.release();

                if (err) {
                    console.error('Database query error:', err);
                    return res.status(500).send('Internal server error');
                } else {
                    const firstNames = result.rows;
                    res.json(firstNames);
                }
            })
        }
    });
};

exports.getLastNames = async (req, res) => {
    const { prefix } = req.body;

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error');
        } else {
            const selectSql = 'SELECT perenimi FROM spotlane';
            const values = [`${prefix}%`]

            conn.execute(selectSql, values, (err, result) => {
                conn.release();

                if (err) {
                    console.error('Database query error:', err);
                    return res.status(500).send('Internal server error');
                } else {
                    const lastNames = result.rows;
                    res.json(lastNames);
                }
            })
        }
    });

};