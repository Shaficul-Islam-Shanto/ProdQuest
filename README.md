# ProdQuest Backend API

This is the **backend** for the ProdQuest platform — a community-driven product recommendation system. It provides a secure RESTful API for managing product queries, user recommendations, and authentication.

---

## 🌐 Live Server URL

[[🔗 Backend API (e.g., Render)](https://your-backend-deployment-url.com)](https://prod-quest-server.vercel.app/queries)

---

## 📌 Purpose

The backend serves the following purposes:

- Handles product query and recommendation data using MongoDB.
- Authenticates users using JWT issued on login.
- Protects private endpoints with middleware.
- Provides structured API endpoints for frontend consumption.

---

## 🚀 Key Features

- **JWT Authentication** for protected routes.
- **MongoDB CRUD** for:
  - Product Queries
  - Recommendations
- **Search Queries** using regex.
- **Recent Queries** fetch with sorting & limit.
- Recommendations **linked to queries** with real-time `recommendationCount` updates.
- **Route Protection** via `verifyJWT` middleware.
- Excludes self-recommendations in “For Me” section.

---

## 🔐 Authentication

- JWTs are issued on login via `/jwt`.
- JWTs must be sent as `Authorization: Bearer <token>` in protected routes.

---

## 📁 Folder Structure

prodquest-backend/
├── .env
├── server.js
├── package.json


---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Auth**: JSON Web Tokens (JWT)
- **Security**: CORS, environment variables

---

## 📦 NPM Packages Used

| Package       | Purpose                                |
|---------------|----------------------------------------|
| `express`     | Server framework                       |
| `cors`        | Cross-Origin Resource Sharing          |
| `dotenv`      | Environment variable management        |
| `mongodb`     | MongoDB driver                         |
| `jsonwebtoken`| JWT creation and verification          |

---

## 📄 Environment Variables (`.env`)

Make sure to create a `.env` file in your backend root with the following:

```env
PORT=3000
JWT_SECRET=your_secret_key
DB_User=your_db_user
DB_PASS=your_db_password
git clone https://github.com/your-username/prodquest-backend.git
cd prodquest-backend
lone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/prodquest-backend.git
cd prodquest-backend

Install dependencies:
npm install

Set up your .env file.

Start the server:
node server.js

🔗 API Endpoints Overview
Auth
POST /jwt — Issue a JWT

Queries
GET /queries — All queries or by ?email=...

POST /queries — Add new query

PUT /queries/:id — Update a query

DELETE /queries/:id — Delete a query

GET /queries/:id — Get a specific query

GET /recent-queries — Get latest 6 queries

GET /search-queries?text=... — Search queries by product name

Recommendations
POST /recommendations — Add recommendation (protected)

GET /recommendations/:queryId — Get all recommendations of a query (protected)

GET /recommendations-by-user?email=... — Recommendations made by a user (protected)

GET /my-query-recommendations?email=... — Recommendations on queries by the user (not including their own) (protected)

DELETE /recommendations/:id — Delete a recommendation (protected)

📦 Deployment Tips
Ensure environment variables are set in your host (Render, Railway, etc.)

Use persistent database (MongoDB Atlas)

Whitelist the IP of your deployment server on MongoDB Atlas

🙋‍♂️ Contributing
If you'd like to contribute:

Fork the repo

Create a new branch

Commit your changes

Submit a Pull Request

📄 License
This project is licensed under the MIT License
