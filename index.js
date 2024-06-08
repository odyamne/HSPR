const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const path = require('path');
const pool2 = require('./src/databasepool').pool;
const poolPromise = require('./src/databasepoolPromise').pool;
const calculatorController = require('./controllers/calculatorController');
const resultController = require('./controllers/resultController');
const athleteController = require('./controllers/athleteController');
const routes = require('./routes/hspr'); // Import HSPR routes

// Configuration
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes for HSPR
app.use('/api/hspr', routes);

app.get('/addresults', (req, res) => {
    res.render('addresults');
});

// Use calculatorController to handle form submission
app.post('/submit-result', calculatorController.postPoints);

app.get('/leaderboard', (req, res) => {
    res.render('leaderboard');
});

// Endpoint definitions for result management
app.get('/recent-results', resultController.getRecentResults);
app.put('/update-result/:id', resultController.updateResult);
app.delete('/delete-result/:id', resultController.deleteResult);
app.get('/allresults', resultController.renderRecentResults);

// Endpoint definitions for athlete management
app.get('/athlete', athleteController.getAthlete);
app.post('/athlete', athleteController.postAthlete);
app.get('/athletes/firstNames', athleteController.getFirstNames);
app.get('/athletes/lastNames', athleteController.getLastNames);

// Test new DB
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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
