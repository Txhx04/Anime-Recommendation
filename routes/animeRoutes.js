const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Get popular anime based on ratings and favorites count
router.get('/anime/popular', (req, res) => {
    const query = `
        SELECT a.anime_id, a.title, a.genre, a.rating, a.release_year, a.studio,
               COUNT(f.favorite_id) as favorite_count
        FROM anime a
        LEFT JOIN favorites f ON a.anime_id = f.anime_id
        GROUP BY a.anime_id
        ORDER BY favorite_count DESC, a.rating DESC
        LIMIT 3
    `;

    db.query(query, [], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});


module.exports = router;