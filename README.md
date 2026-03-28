# MedAlert — Smart Medicine Reminder & Stock Alert

A full-stack MERN application that helps users manage their medication schedules,
track stock levels, and receive multi-channel reminders before doses are missed.

**Live demo:** https://med-alert-delta.vercel.app

---

## Features

- **Dose reminders** — scheduled via Agenda.js with up to 4 nudges per dose
- **Multi-channel notifications** — email, SMS (Twilio), and browser push
- **Stock & expiry alerts** — daily background job flags low stock (≤3) and medicines expiring within 7 days
- **Adherence dashboard** — 14-day trend chart and 30-day adherence percentage
- **Pharmacy module** — browse products, add to cart, place COD orders
- **Role-based access** — admin panel for managing orders and triggering jobs
- **JWT authentication** — secure register/login with protected routes

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5, MongoDB, Mongoose 8 |
| Scheduling | Agenda.js (persistent MongoDB-backed job queue) |
| Notifications | Nodemailer, Twilio SMS, Web Push API |
| Auth | JWT, bcryptjs, role-based middleware |
| Deployment | Vercel (frontend), Render (API + worker), MongoDB Atlas |

---

## Running locally

### Prerequisites
- Node.js 18+
- MongoDB running locally or an Atlas connection string

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # API + Agenda in one process (same as production)
```

### Frontend
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

---

## Project structure
```
medalert/
├── backend/
│   ├── controllers/   # route handlers
│   ├── middleware/    # auth, validation, error handling
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routers
│   ├── jobs/          # Agenda job definitions
│   ├── utils/         # email, SMS, push, scheduler helpers
│   ├── config/        # DB, Agenda, env validation
│   ├── server.js      # Express app entry point
│   └── worker.js      # Agenda worker entry point
└── frontend/
    └── src/
        ├── components/ # Layout, shared UI
        ├── contexts/   # AuthContext
        ├── pages/      # Dashboard, Medicines, Pharmacy, etc.
        └── services/   # Axios API client
```

---

## Environment variables

Create a `.env` file in `backend/` using `.env.example` as a template.
The app will refuse to start if required variables are missing.
