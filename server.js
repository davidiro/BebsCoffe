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

//producs endpoint 
db.run(`CREATE TABLE IF NOT EXISTS PRODUCTS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    PRICE REAL NOT NULL,
    Image TEXT NOT NULL
)`);

// Insert sample products (if empty)
db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (row.count === 0) {
        const sample = [
            { name: "Latte", price: 3.5, image: "/images/cake image" },
            { name: "Cappuccino", price: 4.0, image: "/images/coffeimg1" },
            { name: "Espresso", price: 2.5, image: "/images/coffeimg2" },
            
        ];

        const stmt = db.prepare("INSERT INTO products (name, price, image) VALUES (?, ?, ?)");
        sample.forEach(p => stmt.run(p.name, p.price, p.image));
        stmt.finalize();
    }
});

app.get("/products", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;


  db.all(
    "SELECT name, price, image FROM products LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            res.json(rows);
        }
    );
});