const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const path = require('path');
const pool2 = require('./src/databasepool').pool;
const poolPromise = require('./src/databasepoolPromise').pool;
const resultController = require('./controllers/resultController');
const routes = require('./routes/hspr'); // Import HSPR routes

// Configuration
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Middleware for file uploads
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve static files

// Routes
// ----------------------- HSPR PART --------------------
app.use('/api/hspr', routes); // Use the new API routes

app.get('/addresults', (req, res) => {
    res.render('addresults');
});

app.post('/submit-result', async (req, res) => {
    const { vanusegrupp, ala, eesnimi, perenimi, sugu, meetrid } = req.body;

    if (!vanusegrupp || !ala || !eesnimi || !perenimi || !sugu || !meetrid) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    try {
        // Check if athlete already exists
        const checkAthleteQuery = 'SELECT id FROM sportlane WHERE eesnimi = ? AND perenimi = ? AND sugu = ?';
        const [rows] = await poolPromise.query(checkAthleteQuery, [eesnimi, perenimi, sugu]);

        let sportlaneId;
        if (rows.length > 0) {
            sportlaneId = rows[0].id;
        } else {
            const insertAthleteQuery = 'INSERT INTO sportlane (eesnimi, perenimi, sugu) VALUES (?, ?, ?)';
            const [result] = await poolPromise.query(insertAthleteQuery, [eesnimi, perenimi, sugu]);
            sportlaneId = result.insertId;
        }

        // Calculate points
        const Calculator = require('./models/calculator');
        const calculator = new Calculator(sugu, ala, parseFloat(meetrid));
        const punktid = calculator.calculatePoints();
        const hooaeg = new Date().getFullYear();

        const resultQuery = 'INSERT INTO tulemus (ala, vanusegrupp, meetrid, punktid, hooaeg, sportlane_id) VALUES (?, ?, ?, ?, ?, ?)';
        await poolPromise.query(resultQuery, [ala, vanusegrupp, meetrid, punktid, hooaeg, sportlaneId]);

        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: 'Failed to process the request!' });
    }
});


app.get('/leaderboard', (req, res) => {
    res.render('leaderboard');
    /*
    let sql = 'SELECT DISTINCT hooaeg FROM tulemus';
    pool2.getConnection((err, conn) => {
        if (err) {
            conn.release();
            throw err;
        } else {
            conn.execute(sql, (err, seasons) => {
                if (err) {
                    conn.release();
                    throw err;
                } else {
                    res.render('leaderboard', { seasonsData: seasons });
                    conn.release();
                }
            });
        }
    });
    */
});
// Endpoint definitions
app.get('/recent-results', resultController.getRecentResults);
app.put('/update-result/:id', resultController.updateResult);
app.delete('/delete-result/:id', resultController.deleteResult);
app.get('/allresults', resultController.renderRecentResults);

app.get('/test-new-db', (req, res) => {
    pool2.query('SELECT * FROM edetabel', (err, results) => {
        if (err) {
            console.error('Error connecting to the new database:', err.message);
            res.status(500).json({ message: 'Database connection failed', error: err.message });
        } else {
            console.log('Database connected successfully:', results);
            res.status(200).json({ message: 'Database connection successful', data: results });
        }
    });
});

// Server setup
const PORT = process.env.PORT || 5210;
console.log(`Server running on port ${PORT}`);
app.listen(PORT);
