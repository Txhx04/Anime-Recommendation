const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes');
const animeRoutes = require('./routes/animeRoutes'); // New import
const geminiRoutes = require('./routes/geminiRoutes');

const app = express();
const db = require("C:\\Users\\merch\\Documents\\uni\\Sem4\\wp\\mini project\\models\\db.js");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); 

// Use Routes
app.use('/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', searchRoutes);
app.use('/api', animeRoutes); // Add the new anime routes
app.use('/api/gemini', geminiRoutes);

app.get('/api/genres', (req, res) => {
    db.query('SELECT genre FROM anime WHERE genre IS NOT NULL', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        let uniqueGenres = new Set();
        results.forEach(row => {
            row.genre.split(',').forEach(g => uniqueGenres.add(g.trim())); // Split & trim spaces
        });

        res.json([...uniqueGenres]); // Convert Set to Array
    });
});

app.get('/api/anime', (req, res) => {
    const genre = req.query.genre;
    if (!genre) return res.status(400).json({ error: "Genre parameter is required" });

    db.query('SELECT anime_id, title, release_year, rating FROM anime WHERE genre LIKE ?', [`%${genre}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));

app.get('/api/recommendations/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log("User ID:", userId); // Log the userId for debugging
    const query = `
        SELECT a.anime_id, a.title, a.genre, a.rating, a.release_year, a.studio
        FROM anime a
        WHERE a.anime_id NOT IN (
            SELECT w.anime_id FROM watched_media w WHERE w.user_id = ?
            UNION 
            SELECT f.anime_id FROM favorites f WHERE f.user_id = ?
        )
        ORDER BY a.rating DESC;
    `;

    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(results);
    });
});

app.listen(4000, () => console.log('Server running on port 4000'));