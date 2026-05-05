[![CI](https://github.com/Rishad010/MedAlert/actions/workflows/ci.yml/badge.svg)](https://github.com/Rishad010/MedAlert/actions/workflows/ci.yml)

# MedAlert — Smart Medicine Reminder & Stock Alert

A full-stack MERN application that helps users manage medication schedules,
track stock levels, and receive multi-channel reminders before doses are missed.

**Live demo:** https://med-alert-delta.vercel.app

---

## Features

- **Dose reminders** — scheduled via Agenda.js with up to 4 nudges per dose (10 min apart)
- **Multi-channel notifications** — email (Resend), SMS (Twilio), and browser push (Web Push API + VAPID)
- **Stock & expiry alerts** — daily background job flags low stock (≤ 3 units) and medicines expiring within 7 days
- **Adherence dashboard** — 14-day trend chart and 30-day adherence percentage via Recharts
- **Pharmacy module** — browse in-stock products, place COD orders with optional prescription upload
- **Role-based access** — admin panel for managing orders and manually triggering background jobs
- **JWT authentication** — register/login with protected routes and role-based middleware
- **User settings** — manage name, phone, notification channel preferences, and browser push opt-in

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, React Router 7, TanStack Query, Tailwind CSS, Recharts, react-hook-form, Zod |
| Backend | Node.js (ESM), Express 5, MongoDB, Mongoose 8 |
| Scheduling | Agenda.js — persistent MongoDB-backed job queue |
| Notifications | Resend (email), Twilio (SMS), Web Push API with VAPID |
| Auth | JWT, bcryptjs, express-validator, role-based middleware |
| Logging | Winston — structured console + file logging |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## Architecture

```
medalert/
├── backend/
│   ├── app.js              # Express app (no listen — importable by tests)
│   ├── server.js           # Entry point — connects DB, starts Agenda, calls app.listen
│   ├── config/
│   │   ├── agenda.js       # Agenda instance (shared across jobs)
│   │   ├── db.js           # Mongoose connection
│   │   └── validateEnv.js  # Fails fast on missing required env vars
│   ├── controllers/        # Route handlers (auth, medicines, dashboard, pharmacy, reminders)
│   ├── jobs/
│   │   ├── sendReminder.js      # Agenda job — sends dose nudges, up to 4 per scheduled time
│   │   └── checkStockExpiry.js  # Agenda job — daily stock and expiry check
│   ├── middleware/
│   │   ├── authMiddleware.js        # protect + admin guards
│   │   ├── errorMiddleware.js       # global error handler + 404
│   │   └── validationMiddleware.js  # express-validator rule sets
│   ├── models/             # Mongoose schemas (User, Medicine, Order, Product, Prescription, ReminderLog)
│   ├── routes/             # Express routers
│   ├── scripts/
│   │   └── seedProducts.js # One-shot DB seeder for pharmacy products
│   └── utils/
│       ├── logger.js           # Winston logger (console + file transports)
│       ├── scheduleReminders.js
│       ├── sendEmail.js
│       ├── sendPush.js
│       └── sendSMS.js
└── frontend/
    └── src/
        ├── components/     # Layout, AdminDashboard, shared UI
        ├── contexts/       # AuthContext (JWT session + updateUser)
        ├── pages/          # Dashboard, Medicines, Pharmacy, Reminders, Settings
        └── services/       # Axios API client with auth interceptor
```

---

## Key design decisions

**Agenda.js merged into the API process**
Render's free tier only allows one Web Service. Running Agenda inside `server.js` (rather than a separate `worker.js`) avoids the paid Background Worker tier. A keep-alive self-ping every 10 minutes prevents the free instance from sleeping and killing scheduled jobs.

**Resend over Gmail SMTP**
Render blocks outbound SMTP ports (465, 587) on the free tier. Resend delivers email over HTTPS, bypassing this restriction entirely — no OAuth2 setup required.

**Express app extracted from server entry point**
`app.js` contains the Express setup with no `app.listen` call. `server.js` imports it and starts the server. This separation means the app is cleanly importable by integration tests (Supertest) without starting a real server.

**Fail-fast environment validation**
`validateEnv.js` checks all required env vars at startup and calls `process.exit(1)` if any are missing. The app never silently starts in a broken state.

**Winston for structured logging**
Morgan HTTP logs are piped into Winston so all output — HTTP requests, job events, errors — goes through a single logging system. Error logs are written to `logs/error.log`; all logs to `logs/combined.log`. Stack traces are only exposed in development.

**Input validation on the server**
`express-validator` rule sets are defined in a single `validationMiddleware.js` file and composed per route. Validation runs as middleware before controllers — controllers never handle raw unvalidated input.

---

## Running locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string (or local MongoDB)
- A [Resend](https://resend.com) account for email (free tier is sufficient)
- VAPID keys for push notifications — generate with: `npx web-push generate-vapid-keys`

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values — see table below
npm install
npm run dev            # starts API + Agenda in one process
```

### Frontend
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL and VITE_VAPID_PUBLIC_KEY
npm install
npm run dev
```

### Seed the pharmacy catalog
```bash
cd backend
npm run seed           # inserts 12 sample products into MongoDB
```

---

## Environment variables

### Backend — `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Port the API listens on (e.g. `5000`) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs — use a long random string |
| `VAPID_PUBLIC_KEY` | ✅ | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | ✅ | VAPID private key for web push |
| `VAPID_SUBJECT` | ✅ | `mailto:you@example.com` |
| `CLIENT_URL` | Recommended (✅ in production) | Frontend deployment URL used by backend CORS (e.g. `https://your-app.vercel.app`) |
| `RENDER_EXTERNAL_URL` | ✅ on Render | Enables keep-alive self-ping on Render free tier |
| `RESEND_API_KEY` | Optional | Resend API key — enables email notifications |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio — enables SMS notifications |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `TWILIO_PHONE` | Optional | Twilio sender phone number |

### Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g. `https://your-app.onrender.com/api`) |
| `VITE_VAPID_PUBLIC_KEY` | ✅ | Same VAPID public key as backend — used to subscribe to push |

---

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Health check |
| POST | `/api/auth/register` | — | Register, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | User | Current user profile |
| PATCH | `/api/auth/profile` | User | Update name, phone, notification prefs |
| GET | `/api/medicines` | User | List user's medicines |
| POST | `/api/medicines` | User | Create medicine + schedule reminders |
| PUT | `/api/medicines/:id` | User | Update medicine + reschedule reminders |
| DELETE | `/api/medicines/:id` | User | Delete medicine + cancel Agenda jobs |
| GET | `/api/dashboard` | User | Stats, adherence %, trend chart data |
| GET | `/api/reminders` | User | Reminder logs (last 200) |
| PUT | `/api/reminders/:id/acknowledge` | User | Mark dose as taken |
| GET | `/api/pharmacy/products` | User | In-stock products |
| POST | `/api/pharmacy/orders` | User | Place order |
| GET | `/api/pharmacy/orders` | Admin | All orders |
| PUT | `/api/pharmacy/orders/:id/status` | Admin | Update order status |
| POST | `/api/push/subscribe` | User | Save push subscription |
| DELETE | `/api/push/unsubscribe` | User | Remove push subscription |
| POST | `/api/test/trigger-stock-expiry` | Admin | Manually run stock/expiry job |

---

## Deployment notes

The app is deployed across three services:

- **MongoDB Atlas** — free M0 cluster, shared across environments
- **Render** — free Web Service running `node server.js`; Agenda runs in-process
- **Vercel** — frontend static build; `VITE_API_URL` points to the Render service

CORS uses `CLIENT_URL` (with local fallback `http://localhost:5173`). In production, set `CLIENT_URL` to your frontend deployment URL so browser requests are allowed.