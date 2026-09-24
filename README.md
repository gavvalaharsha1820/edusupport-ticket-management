# EduSupport — Student Support & Ticket Management

A MERN-based Student Support & Ticket Management system developed for the Edumerge Product Engineering Assignment.

EduSupport provides a centralized workflow for students to raise support requests and for staff/admin users to manage ticket ownership, priority, status, SLA ageing, resolution and activity history.

---

## Live Demo

### Frontend

https://edusupport-mmjt.onrender.com/

### Backend API

https://edusupport-api-12hv.onrender.com/

---

## Problem Statement

Students may need support for requests related to:

- Fees
- Attendance
- ID cards
- Documents
- Certificates
- Other institutional support services

EduSupport provides a centralized ticket management system where:

1. Students create and track support requests.
2. Admins assign and manage ticket ownership.
3. Staff members process tickets assigned to them.
4. Ticket priority and status can be updated.
5. SLA ageing can be tracked.
6. Comments and activity history provide visibility into ticket progress.

---

## Features

### Authentication

- JWT-based authentication
- Role-based authorization
- Student self-registration
- Secure password hashing using bcrypt
- Profile/name editing
- Change password
- Logout

### Student

- Create support requests
- Select ticket category
- Set ticket priority
- View own tickets
- Track ticket status
- Add comments
- View ticket activity/history

### Staff

- View support tickets
- View ticket details
- Modify tickets assigned to them
- Update ticket status
- Update ticket priority
- Add comments
- Track ticket ageing and SLA information

### Admin

- View all tickets
- Assign tickets to staff
- Reassign tickets
- Update ticket status and priority
- Add comments
- View dashboard metrics
- Manage users

### Ticket Management

- Ticket categories
- Priority levels
- Status workflow
- Ticket ownership
- Staff assignment
- SLA ageing
- Activity history
- Comments
- Resolution tracking

### Dashboard

The dashboard provides operational visibility into ticket activity, including:

- Total tickets
- Open tickets
- In-progress tickets
- Resolved tickets
- Priority distribution
- Ticket ageing
- Recent activity

---

## User Roles

| Role    | Capabilities                                     |
| ------- | ------------------------------------------------ |
| Student | Create and track own support tickets             |
| Staff   | View tickets and modify tickets assigned to them |
| Admin   | Manage users, assignments and ticket operations  |

### Ticket Access Rules

- Students can access only their own tickets.
- Staff can view tickets but can modify only tickets assigned to them.
- Admins can modify and reassign tickets.
- Ticket assignment is controlled by Admin users.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- REST APIs
- JWT
- bcrypt

### Database

- MongoDB Atlas
- Mongoose

### Deployment

- Render

---

## Architecture

                    ┌─────────────────────┐
                    │       Student       │
                    └──────────┬──────────┘
                               │
                               │
                    ┌──────────▼──────────┐
                    │   React + Vite UI   │
                    └──────────┬──────────┘
                               │
                            REST API
                               │
                    ┌──────────▼──────────┐
                    │   Express Backend   │
                    │                      │
                    │ JWT Authentication   │
                    │ Role Authorization  │
                    │ Ticket Management   │
                    └──────────┬──────────┘
                               │
                         Mongoose ODM
                               │
                    ┌──────────▼──────────┐
                    │    MongoDB Atlas    │
                    └─────────────────────┘

                     Staff ───────────────┘
                     Admin ────────────────┘

## Project Structure

```text

edusupport-ticket-management/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── TicketDetailModal.jsx
│   │   │
│   │   ├── constants/
│   │   │   └── options.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   │
│   │   ├── lib/
│   │   │   └── api.js
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TicketsPage.jsx
│   │   │   ├── NewTicketPage.jsx
│   │   │   └── UsersPage.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.js
│   │   │   ├── tickets.js
│   │   │   └── users.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Ticket.js
│   │   │   └── Activity.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── tickets.js
│   │   │   └── users.js
│   │   │
│   │   ├── utils/
│   │   │   └── sla.js
│   │   │
│   │   ├── seed.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```
## Local Setup

### Prerequisites

Make sure the following are installed:

Node.js
npm
MongoDB Atlas account
Git
1. Clone the Repository
git clone https://github.com/gavvalaharsha1820/edusupport-ticket-management.git

Then:

cd edusupport-ticket-management
2. Configure the Backend

Navigate to the server:

cd server

Install dependencies:

npm install

Create a file:

server/.env

Use .env.example as a reference.

Example:

PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

Do not commit .env to GitHub.

3. Seed Demo Users

From the server directory:

npm run seed

The seed script creates the demo accounts if they do not already exist.

It does not delete existing users or tickets.

4. Start the Backend
npm run dev

The backend runs on:

http://localhost:5000
5. Start the Frontend

Open a second terminal.

From the project root:

cd client

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend runs on:

http://localhost:5173
## Demo Accounts
Student
Email: student@edusupport.com
Password: Student@123
Staff
Email: staff@edusupport.com
Password: Staff@123
Admin
Email: admin@edusupport.com
Password: Admin@123

These accounts are intended for demonstration purposes.

## Ticket Workflow
```text
Student
   |
   | Create Support Request
   v
New Ticket
   |
   | Admin Assignment
   v
Assigned Staff
   |
   | Processing
   v
In Progress
   |
   | Resolution
   v
Resolved
   |
   v
Closed
```
Ticket activity and comments provide a history of important actions throughout the workflow.

## Status Workflow

Tickets can move through different operational states such as:
``` text
Open
  ↓
In Progress
  ↓
Resolved
  ↓
Closed
```
The exact transition is controlled by the application's ticket management workflow.

## Priority & SLA

Tickets support priority levels that influence expected response/resolution time.

SLA ageing is calculated using:

Ticket creation time
Ticket priority
Current time

This provides staff and administrators with visibility into ageing and pending work.

## Security & Authorization

The backend implements authorization using JWT and role-based access control.

### Authentication

Users authenticate through the login API and receive a JWT token.

### Authorization

Backend APIs verify:

JWT validity
User existence
Active user status
User role
Ticket ownership/assignment where applicable

Frontend controls are therefore supported by backend authorization rather than relying only on UI restrictions.

## Engineering Decisions
### MERN Architecture

React was selected for the frontend and Express/Node.js for the backend to provide a clear separation between UI, API and data layers.

### MongoDB Atlas

MongoDB was selected because the ticket and activity data are naturally represented as document-oriented records and the application requires flexible ticket metadata.

### JWT Authentication

JWT provides stateless authentication between the React frontend and Express API.

Role-Based Authorization

Different responsibilities are enforced based on Student, Staff and Admin roles.

Ticket Ownership

Staff members can modify tickets assigned to them. Other staff members can view tickets but cannot modify tickets that are not assigned to them. Admins have broader management access.

Activity History

Ticket activity records provide an audit-style history of important ticket events and comments.

## Validation & Edge Cases

The application handles cases including:

Invalid login credentials
Invalid or expired JWT tokens
Inactive users
Unauthorized ticket modification
Students attempting to access other students' tickets
Staff attempting to modify unassigned tickets
Missing required ticket fields
Invalid ticket IDs
Invalid ticket status/priority values
Incorrect current password
Passwords below the minimum length
Duplicate user registration
Empty ticket lists
Unassigned tickets
## Assumptions

The following assumptions were made for the prototype:

Admin users are responsible for assigning and reassigning tickets.
Staff members can modify only tickets assigned to them.
Students can access only their own tickets.
Email-based password recovery is outside the scope of this prototype.
SLA durations are determined by ticket priority.
MongoDB Atlas is used as the application database.
The prototype uses seeded demonstration accounts for evaluation.
Notifications outside the application are outside the current prototype scope.
## Scope & Trade-offs

The implementation focuses on the core ticket lifecycle and operational workflow rather than adding secondary features that are not essential to the assignment.

The prototype intentionally does not include:

Email notification infrastructure
External SMS notifications
Complex enterprise workflow configuration
Email-based password recovery
Advanced reporting/BI integration

These could be added in a production implementation depending on institutional requirements.

## Testing

The application was manually validated for the primary user workflows:

Student
Login
Registration
Ticket creation
Ticket viewing
Commenting
Profile editing
Password change
Logout
Staff
Login
Ticket viewing
Assigned ticket modification
Status updates
Priority updates
Comments
Read-only access to tickets assigned to other staff
Admin
Login
Dashboard
Ticket management
Assignment
Reassignment
Status updates
Priority updates
User management
Profile editing
Password change
Responsive UI

The application was also checked for desktop and mobile layouts.

## Deployment

The application is deployed using Render.

### Frontend 
https://edusupport-mmjt.onrender.com/
### Backend
https://edusupport-api-12hv.onrender.com/

The production frontend communicates with the deployed Express API through the configured API URL.

## Repository

### GitHub:

https://github.com/gavvalaharsha1820/edusupport-ticket-management/
```
