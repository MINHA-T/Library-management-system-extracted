# LibraryMS — Next.js Edition

A full rewrite of the original PHP/MySQL Library Management System as a
Next.js (App Router, JavaScript) application, ready to deploy on Vercel.
No PHP anywhere — every `.php` page, include, and PDO query has been
converted to a React page and a parameterized MySQL API route.

## What changed vs. the PHP version

| PHP version | Next.js version |
|---|---|
| `config/database.php` (PDO) | `lib/db.js` (mysql2/promise pool) |
| `includes/auth.php` ($_SESSION) | `lib/auth.js` + `middleware.js` (signed JWT httpOnly cookie) |
| `includes/header.php` / `sidebar.php` / `footer.php` | `components/Topbar.js`, `components/Sidebar.js`, `lib/ui-context.js` (alerts/loading/confirm modal), rendered from `app/(protected)/layout.js` |
| `login.php` | `app/login/page.js` + `app/api/auth/login/route.js` |
| `logout.php` | `app/api/auth/logout/route.js` |
| `dashboard.php` | `app/(protected)/dashboard/page.js` + `app/api/dashboard/route.js` |
| `books.php` (search/add/edit/delete actions) | `app/(protected)/books/page.js` + `app/api/books/route.js` + `app/api/books/[id]/route.js` |
| `transactions.php` (borrow/return/list actions) | `app/(protected)/transactions/page.js` + `app/api/transactions/route.js` + `app/api/transactions/[id]/route.js` |
| `assets/css/style.css` | `app/globals.css` (copied as-is — identical design) |
| `assets/js/main.js` | Replaced by React state/effects inside each page + `lib/ui-context.js` |

The database schema (`database/schema.sql`) is unchanged.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file and fill in your MySQL credentials:
   ```bash
   cp .env.example .env.local
   ```
3. Create the database and load the schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:3000` and sign in with `admin` / `admin123`
   (all three seed accounts use `admin123`).

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Import the repository in Vercel.
3. Under Project Settings → Environment Variables, add:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `JWT_SECRET` (a long random string — e.g. `openssl rand -base64 48`)
4. Point `DB_HOST` at a MySQL instance reachable from Vercel (e.g. PlanetScale,
   Railway, Amazon RDS, or any managed MySQL host — Vercel does not host MySQL
   itself).
5. Deploy. No further configuration is required.

## Roles

Roles (`admin`, `librarian`, `member`) are preserved exactly as defined in
the `users` table's `role` ENUM and are included in the session JWT, ready
to be used for role-based UI/route checks if you want to extend the app
further.
