# EduSupport — Student Support & Ticket Management

A MERN application for the Edumerge Product Engineering Assignment 4.

## Features
- Single login page for Student, Staff and Admin
- Student self-registration
- JWT authentication and role-based authorization
- Student ticket creation and tracking
- Staff/Admin ticket assignment, status and priority management
- SLA ageing based on priority
- Activity history and comments
- Admin user management
- Dashboard metrics and operational views

## Project structure

```text
edusupport/
├── client/
│   └── src/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       ├── lib/
│       └── pages/
└── server/
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        └── utils/
```

## Setup

### Server
```bash
cd server
npm install
```

Create `server/.env` from `.env.example` and add your MongoDB Atlas URI.

```bash
npm run seed
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## Demo accounts

- Student: `student@edusupport.com` / `Student@123`
- Staff: `staff@edusupport.com` / `Staff@123`
- Admin: `admin@edusupport.com` / `Admin@123`

The seed script is safe to run on an existing database because it only inserts missing demo users; it does not delete tickets or existing users.


