const bcrypt = require('bcrypt');
const db = require('../models/db');

// **REGISTER NEW USER**
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
    db.query(checkQuery, [username, email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (result.length > 0) return res.status(400).json({ message: "Username or Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

        db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: "Error registering user" });

            res.status(201).json({ message: "User registered successfully" });
        });
    });
};

// **USER LOGIN**
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0) return res.status(400).json({ message: "Invalid email or password" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        res.status(200).json({ 
            message: "Login successful", 
            user: { id: user.user_id, username: user.username, email: user.email } 
        });
    });
};
