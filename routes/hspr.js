const express = require('express');
const router = express.Router();
const resultsController = require("../controllers/resultController");
const calculatorController = require("../controllers/calculatorController");
const athleteController = require("../controllers/athleteController");

router.get('/leaderboard', resultsController.getLeaderboard);

router.get('/athlete', athleteController.getAthlete);
router.post('/athlete', athleteController.postAthlete);
router.get('/athletes/firstNames', athleteController.getFirstNames);
router.get('/athletes/lastNames', athleteController.getLastNames);

router.post('/calculate', calculatorController.postPoints);

module.exports = router;