const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
const db = new sqlite3.Database("CafeDataBase.db");//our data base 

//express can only serve files from the public folder shitty i know.
app.use(express.static("public"));

app.use(bodyParser.json());

//load the home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/Homepage.html");
});


//create user table 
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        UserName TEXT,
        Password TEXT,
        Email TEXT
    )
`);

// SIGNUP
app.post("/signup", (req, res) => { //sign up end point for express 
    const { username, email, password } = req.body;

    db.run(
        "INSERT INTO users (UserName, Password, Email) VALUES (?, ?, ?)",
        [username, password, email],
        //display errors with message 
        err => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Error creating user" });//display result  message as  error message on http status 500
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
                res.json({ message: "Login successful" });//user exists 
            }
        }
    );
});





// Create products table + insert sample data safely
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT NOT NULL
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
        if (err) {
            console.error("Count error:", err);
            return;
        }

        if (row.count === 0) {
            const products = [//products to be added to database for front end to recieve 
                { name: "Latte", price: 3.99, image: "/images/breakfastsan.webp" },
                { name: "Cappuccino", price: 4.25, image: "/images/coffeimg2.jpg" },
                { name: "Espresso", price: 2.15, image: "/images/coffeimg3.jpg" },
                { name: "Mocha", price: 5.0, image: "/images/chocolate_mocha.webp" },
                { name: "cake", price: 7.15, image: "/images/cake_image.jpg" },
                { name: "breakfast san", price: 4.25, image: "/images/breakfastsan.webp" },
                { name: "Mango juice", price: 5.99, image: "/images/mango_juice.avif" },
                { name: "espresso", price: 3.50, image: "/images/espresso.avif" },
                { name: "bacon sandwitch", price: 3.50, image: "/images/bacon_san.webp" },
            ];

            const stmt = db.prepare(
                "INSERT INTO products (name, price, image) VALUES (?, ?, ?)"
            );

            products.forEach(p => {
                stmt.run(p.name, p.price, p.image);
            });

            stmt.finalize();
        }
    });
});

app.get("/products", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;

    db.all(
        "SELECT name, price, image FROM products LIMIT ? OFFSET ?",
        [limit, offset],
        (err, rows) => {
            if (err) {
                console.error("Fetch error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json(rows);
        }
    );
});


db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Featured (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            position INTEGER NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);
});
//featured end point  
app.get("/featured", (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 4; // products per slide
    const offset = (page - 1) * limit;

    db.all(
        `
        SELECT p.id, p.name, p.price, p.image
        FROM Featured f
        JOIN products p ON f.product_id = p.id
        ORDER BY f.position
        LIMIT ? OFFSET ?
        `,
        [limit, offset],
        (err, rows) => {
            if (err) {
                console.error("DB error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json(rows);
        }
    );
});

// Create employee table and add data without seralizable
// db.run(` 
// CREATE TABLE IF NOT EXISTS Employees (
//         EMPLOYEE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
//         EMPLOYEE_NAME TEXT NOT NULL,
//         IMAGE TEXT NOT NULL,
//         YEARS INTEGER NOT NULL,
//         EXPERIENCE TEXT NOT NULL
//     )
    
// `);


//Avoid duplicate entries
db.get("SELECT COUNT(*) AS count FROM Employees", (err, row) => {
    if (err) {
        console.error("COUNT error:", err);
        return;
    }

    if (row.count === 0) {
        db.run(`
            INSERT INTO Employees (EMPLOYEE_NAME, IMAGE, YEARS, EXPERIENCE) VALUES
            ('Robert Johnson', 'images/robert.webp', 5, 'Barista Specialist'),
            ('Michael Smith', 'images/David.webp', 8, 'Cafe Manager'),
            ('David irofuala', 'images/Mike.webp', 3, 'Pastry Chef'),
            ('kanyinsola Adebisi', 'images/kanyin.webp', 4, 'Front of House Manager')
        `);
    }
});


// meet the team end point
app.get("/team", (req, res) => {
    db.all('SELECT * FROM Employees', (err, rows) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(rows);
    });
});

// Start server listening 
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
