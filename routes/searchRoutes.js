const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Search API Endpoint
router.get('/search', (req, res) => {
    const searchQuery = req.query.query || '';

    // Define valid sorting columns
    const validSortColumns = ['title', 'rating', 'release_year', 'studio'];
    const sortBy = validSortColumns.includes(req.query.sortBy) ? req.query.sortBy : 'title';

    let query = `
        SELECT anime_id, title, rating, genre, release_year, studio 
        FROM anime 
        WHERE title LIKE ?
        ORDER BY ${sortBy} ASC
    `;

    db.query(query, [`${searchQuery}%`], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

module.exports = router;
