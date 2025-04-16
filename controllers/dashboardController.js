const db = require('../models/db'); // Import MySQL connection

// Get User Favorites (last 10)
exports.getFavorites = (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT a.anime_id, a.title, a.genre, a.rating, a.release_year, a.studio
        FROM favorites f
        JOIN anime a ON f.anime_id = a.anime_id
        WHERE f.user_id = ?
        ORDER BY f.added_date DESC
        LIMIT 10
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.json(results);
    });
};

// Get User History (last 10)
exports.getHistory = (req, res) => {
    const userId = req.params.userId;
    console.log("📌 Received userId in backend:", userId);

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const query = `
        SELECT w.anime_id, a.title, w.watched_date
        FROM watched_media w
        JOIN anime a ON w.anime_id = a.anime_id
        WHERE w.user_id = ?
        ORDER BY w.watched_date DESC
        LIMIT 10;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        console.log("✅ Fetched user history:", results);
        res.json(results);
    });
};

// Check if anime is in user's favorites
exports.checkFavorite = (req, res) => {
    const userId = req.params.userId;
    const animeId = req.params.animeId;
    
    const query = `
        SELECT COUNT(*) as count 
        FROM favorites 
        WHERE user_id = ? AND anime_id = ?
    `;
    
    db.query(query, [userId, animeId], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        const isFavorite = results[0].count > 0;
        res.json({ isFavorite });
    });
};

// Check if anime is in user's watched list
exports.checkWatched = (req, res) => {
    const userId = req.params.userId;
    const animeId = req.params.animeId;
    
    const query = `
        SELECT COUNT(*) as count 
        FROM watched_media 
        WHERE user_id = ? AND anime_id = ?
    `;
    
    db.query(query, [userId, animeId], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        const isWatched = results[0].count > 0;
        res.json({ isWatched });
    });
};

// Add anime to favorites
exports.addToFavorites = (req, res) => {
    const { userId, animeId } = req.body;
    
    if (!userId || !animeId) {
        return res.status(400).json({ message: "User ID and Anime ID are required" });
    }
    
    // First check if it's already a favorite
    const checkQuery = `
        SELECT COUNT(*) as count 
        FROM favorites 
        WHERE user_id = ? AND anime_id = ?
    `;
    
    db.query(checkQuery, [userId, animeId], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        if (results[0].count > 0) {
            return res.status(409).json({ message: "Already in favorites" });
        }
        
        // Add to favorites with current timestamp
        const insertQuery = `
            INSERT INTO favorites (user_id, anime_id, added_date) 
            VALUES (?, ?, NOW())
        `;
        
        db.query(insertQuery, [userId, animeId], (err, result) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            
            res.status(201).json({ message: "Added to favorites" });
        });
    });
};

exports.removeFromFavorites = (req, res) => {
    const { userId, animeId } = req.body;
    
    if (!userId || !animeId) {
        return res.status(400).json({ message: "User ID and Anime ID are required" });
    }
    
    // First check if it's in favorites
    const checkQuery = `
        SELECT COUNT(*) as count 
        FROM favorites 
        WHERE user_id = ? AND anime_id = ?
    `;
    
    db.query(checkQuery, [userId, animeId], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        if (results[0].count === 0) {
            return res.status(404).json({ message: "Not in favorites" });
        }

        const deleteQuery = `
            DELETE FROM favorites WHERE user_id = ? AND anime_id = ? 
        `;
        
        db.query(deleteQuery, [userId, animeId], (err) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            
            res.status(200).json({ message: "Deleted from favorites" });
        });
    });
};


// Add anime to watched list
exports.addToWatched = (req, res) => {
    const { userId, animeId } = req.body;
    
    if (!userId || !animeId) {
        return res.status(400).json({ message: "User ID and Anime ID are required" });
    }
    
    // First check if it's already watched
    const checkQuery = `
        SELECT COUNT(*) as count 
        FROM watched_media 
        WHERE user_id = ? AND anime_id = ?
    `;
    
    db.query(checkQuery, [userId, animeId], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        if (results[0].count > 0) {
            return res.status(409).json({ message: "Already marked as watched" });
        }
        
        // Add to watched with current timestamp
        const insertQuery = `
            INSERT INTO watched_media (user_id, anime_id, watched_date) 
            VALUES (?, ?, NOW())
        `;
        
        db.query(insertQuery, [userId, animeId], (err, result) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            
            res.status(201).json({ message: "Marked as watched" });
        });
    });
};