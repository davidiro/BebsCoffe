const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
const db = new sqlite3.Database("CafeDataBase.db");

app.use(express.static("public"));

app.use(bodyParser.json());

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        UserName TEXT,
        Password TEXT,
        Email TEXT
    )
`);

// SIGNUP
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    db.run(
        "INSERT INTO users (UserName, Password, Email) VALUES (?, ?, ?)",
        [username, password, email],
        err => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Error creating user" });
            } else {
                res.json({ message: "User created successfully" });
            }
        }
    );
});

// LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE Email = ? AND Password = ?",
        [email, password],
        (err, user) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Server error" });
            } else if (!user) {
                res.status(401).json({ message: "Invalid email or password" });
            } else {
                res.json({ message: "Login successful" });
            }
        }
    );
});

// LISTEN 
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
