const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
const db = new sqlite3.Database("CafeDataBase.db");

app.use(express.static("public"));

app.use(bodyParser.json());

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserName TEXT,
    Password TEXT,
    Email TEXT
)`);

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    db.run(
        `INSERT INTO users (UserName, Password, Email) VALUES (?, ?, ?)`,
        [username, password, email],
        function(err){
            if(err){
                console.log(err); // useful for debugging
                res.status(500).json({message: "Error creating user"});
            } else {
                res.status(200).json({message: "User created successfully"});
            }
        }
    );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
