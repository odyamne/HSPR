const Calculator = require('../models/calculator');
const athleteController = require('./athleteController');
const poolPromise = require('../src/databasepoolPromise').pool;

// POST tulemuste tabelisse
exports.postPoints = async (req, res) => {
    const { eesnimi, perenimi, sugu, ala, vanusegrupp, meetrid } = req.body;
    const hooaeg = new Date().getFullYear(); // automaatne hooaja määramine

    if (!eesnimi || !perenimi || !sugu || !ala || !vanusegrupp || !meetrid) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    try {
        // Get or create athlete and retrieve athlete ID
        const athleteId = await athleteController.getOrCreateAthlete(eesnimi, perenimi, sugu);

        // Calculate points
        const calculator = new Calculator(sugu, ala, parseFloat(meetrid));
        const punktid = calculator.calculatePoints();

        // Insert the result into the database
        const insertResultSql = 'INSERT INTO tulemus (sportlane_id, ala, vanusegrupp, meetrid, punktid, hooaeg) VALUES (?, ?, ?, ?, ?, ?)';
        await poolPromise.query(insertResultSql, [athleteId, ala, vanusegrupp, meetrid, punktid, hooaeg]);

        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: 'Failed to process the request!' });
    }
};
