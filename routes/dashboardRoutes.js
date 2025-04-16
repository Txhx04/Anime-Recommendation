const express = require('express');
const dashboardController = require('../controllers/dashboardController.js'); // Import controller

const router = express.Router();

// Routes for fetching favorites and history
router.get('/favorites/:userId', dashboardController.getFavorites);
router.get('/history/:userId', dashboardController.getHistory);

router.get('/check-favorite/:userId/:animeId', dashboardController.checkFavorite);
router.get('/check-watched/:userId/:animeId', dashboardController.checkWatched);
router.post('/favorites/add', dashboardController.addToFavorites);
router.post('/watched/add', dashboardController.addToWatched);
router.post('/favorites/delete', dashboardController.removeFromFavorites);
module.exports = router;
