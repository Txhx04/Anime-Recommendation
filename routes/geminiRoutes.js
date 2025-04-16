const express = require('express');
const geminiController = require('../controllers/geminiController');
const router = express.Router();

// Route to get an image for an anime
router.get('/image/:animeId', geminiController.getAnimeImage);

// Route to force regeneration of an image
router.post('/generate/:animeId', geminiController.generateAnimeImage);

module.exports = router;    