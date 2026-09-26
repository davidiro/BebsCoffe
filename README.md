# Bays Cafe

A small full-stack website for a fictional coffee shop, built with Express and SQLite. Homepage, a paginated menu, an about/meet-the-team page, and basic signup/login — no frameworks on the frontend, just HTML, CSS, and vanilla JS talking to a handful of REST endpoints.

## What's in it

- **Homepage** with a rotating "featured items" carousel, paginated server-side
- **Products page** with pagination and a search/filter bar
- **About page** with a "meet the team" section pulled from the database
- **Signup / Login** forms backed by a `users` table
- SQLite database (`CafeDataBase.db`) that seeds itself with sample products, featured items, and staff on first run

## Tech stack

- **Backend:** Node.js, Express 5
- **Database:** SQLite3
- **Frontend:** Plain HTML/CSS/JS (no build step)

## Getting started

```bash
git clone https://github.com/davidiro/BebsCoffe.git
cd BebsCoffe
npm install
npm start
```

The server runs at `http://localhost:3000`. The SQLite file and its tables (`users`, `products`, `Featured`, `Employees`) are created automatically the first time you run it, along with some seed data so the pages aren't empty.

## API endpoints

| Method | Route            | Description                                   |
|--------|-------------------|------------------------------------------------|
| GET    | `/products`       | Paginated product list (`?page=`, 6 per page)  |
| GET    | `/featured`       | Paginated featured items (`?page=`, 4 per page)|
| GET    | `/team`           | All employees                                  |
| POST   | `/signup`         | Create a user (`username`, `email`, `password`)|
| POST   | `/login`          | Check email + password against the `users` table |

## Project structure

```
BayCafe/
├── server.js              # Express app, routes, DB setup/seeding
├── CafeDataBase.db         # SQLite database (auto-created)
├── public/
│   ├── Homepage.html / HomeStyle.css
│   ├── products.html / products.css
│   ├── aboutus.html / aboutus.css
│   ├── login.html / Login.css
│   ├── SignUp.html / SignUp.css
│   └── images/
└── package.json
```

## Notes

This started as a learning project, so a few things are simplified on purpose rather than production-ready: passwords are stored in plain text (no hashing yet),
there's no session/token auth after login, and there's no input validation beyond what the HTML forms enforce. Good next steps if this grows further: bcrypt for passwords, 
express-session or JWTs, and moving the seed data into a migration script instead of inline `INSERT`s in `server.js`.

