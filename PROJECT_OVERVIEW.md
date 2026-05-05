# MedAlert Project Overview

## 1) Project Structure

This repository is a monorepo with a Node.js backend and a React frontend.

### Root (`medalert/`)
- `README.md` - Setup instructions, architecture notes, API references.
- `.gitignore` - Ignore rules for dependencies, build artifacts, and env files.
- `backend/` - API server, business logic, database models, jobs, integrations.
- `frontend/` - React web app (UI, routing, state, API client).

### Backend (`medalert/backend/`)
- `server.js` - Main API bootstrap (middleware, routes, DB/job init).
- `worker.js` - Standalone background job worker (Agenda).
- `package.json` - Backend dependencies and scripts.
- `.env`, `.env.example` - Runtime configuration and sample env structure.
- `config/`
  - `db.js` - MongoDB connection.
  - `agenda.js` - Agenda scheduler setup.
  - `validateEnv.js` - Startup env validation (required/optional vars).
- `controllers/`
  - `authController.js` - Auth + profile actions.
  - `medicineController.js` - Medicine CRUD and reminder scheduling hooks.
  - `dashboardController.js` - Dashboard aggregates/metrics.
  - `reminderController.js` - Reminder listing and acknowledgement.
  - `pharmacyController.js` - Product/order flows.
- `routes/`
  - `authRoutes.js`, `medicineRoutes.js`, `dashboardRoutes.js`, `reminderRoutes.js`, `pharmacyRoutes.js`, `pushRoutes.js`, `testRoutes.js`, `assistantRoutes.js`.
- `models/`
  - `User.js`, `Medicine.js`, `ReminderLog.js`, `Product.js`, `Order.js`, `Prescription.js`.
- `jobs/`
  - `sendReminder.js` - Dose reminder and nudge scheduling logic.
  - `checkStockExpiry.js` - Low stock and near-expiry detection.
- `middleware/`
  - `authMiddleware.js` - JWT auth guard + admin role guard.
  - `validationMiddleware.js` - Request validation handling.
  - `errorMiddleware.js` - Centralized error handling.
- `utils/`
  - `scheduleReminders.js` - Agenda job scheduling helper for medicines.
  - `sendEmail.js`, `sendSMS.js`, `sendPush.js` - Notification channel senders.
  - `assistantMedicineActions.js` - AI assistant tool actions for medicine data.
  - `logger.js` - Logging utility.
- `scripts/seedProducts.js` - Seed script for pharmacy products.
- `data/medicineNames.js` - Approved medicine name list.

### Frontend (`medalert/frontend/`)
- `package.json` - Frontend dependencies and scripts.
- `.env` - Frontend runtime variables.
- `index.html`, `vite.config.ts` - Vite app entry/build config.
- `public/sw.js` - Service worker for push notifications.
- `src/main.tsx` - React app bootstrap and providers.
- `src/App.tsx` - App routes and route guards.
- `src/services/api.ts` - Axios client + auth interceptors + API wrappers.
- `src/contexts/AuthContext.tsx` - User session/auth context.
- `src/pages/`
  - `Login.tsx`, `Register.tsx`, `Dashboard.tsx`, `Medicines.tsx`, `AddMedicine.tsx`, `EditMedicine.tsx`, `Reminders.tsx`, `Pharmacy.tsx`, `Settings.tsx`, `Assistant.tsx`.
- `src/components/`
  - `Layout.tsx`, `AdminDashboard.tsx`, `MedicineAutocomplete.tsx`, `TimePicker.tsx`.
- `src/data/medicineNames.ts` - Frontend medicine search list.
- `src/utils/` - Validation helpers.

---

## 2) Tech Stack & Dependencies

## Backend (`backend/package.json`)
- Runtime: Node.js (ESM), Express 5.
- Database: MongoDB with Mongoose.
- Auth/security: `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`.
- Validation: `express-validator`.
- Scheduling/jobs: `agenda` (active), `node-cron` (installed).
- Notifications:
  - Email: `nodemailer` (active implementation), plus `resend` and `@sendgrid/mail` packages present.
  - SMS: `twilio`.
  - Push: `web-push`.
- AI integrations: `@google/generative-ai`, `@anthropic-ai/sdk`.
- Logging/ops: `morgan`, `winston`.
- Scripts:
  - `npm run start` -> start API server
  - `npm run start:worker` -> start worker
  - `npm run dev` / `npm run dev:worker`
  - `npm run seed` -> seed products

## Frontend (`frontend/package.json`)
- Framework: React 19 + TypeScript.
- Build tooling: Vite.
- Routing/data: `react-router-dom`, `@tanstack/react-query`, `axios`.
- Forms/validation: `react-hook-form`, `zod`.
- Styling/UI: `tailwindcss`, `@tailwindcss/forms`, `lucide-react`, `clsx`, `tailwind-merge`.
- Time/charts/utilities: `date-fns`, `react-clock`, `react-time-picker`, `recharts`.
- Scripts:
  - `npm run dev` -> Vite dev server
  - `npm run build` -> TypeScript + production build
  - `npm run preview` -> preview build

---

## 3) Database Models / Schemas

All schemas are Mongoose models in `backend/models/`.

- `User`
  - Core fields: `name`, `email` (unique), `password`, `role`.
  - Notification settings: `notifications` (`email`, `push`, `sms`), `pushSubscription`, `phone`.
  - Includes password hash pre-save hook and password compare method.

- `Medicine`
  - Fields: `user` ref, `name`, `dosage`, `schedule`, `stock`, `expiryDate`, `storageNotes`.

- `ReminderLog`
  - Fields: `user` ref, `medicine` ref, `sentAt`, `status`, `channel`, `acknowledged`, `acknowledgedAt`.

- `Product`
  - Pharmacy catalog model with `sku`, name/strength/form, price, stock quantity, prescription requirement.

- `Order`
  - Order lifecycle/status model with `items`, customer contact/address, total, payment mode, status, optional prescription ref.

- `Prescription`
  - User-linked uploaded prescription metadata (`fileUrl`, `verified`).

---

## 4) API Endpoints / Routes

Base server route:
- `GET /` - API health/welcome response.

## Auth (`/api/auth`)
- `POST /register` - Register user.
- `POST /login` - Login user and return JWT.
- `GET /me` - Get current user (protected).
- `PATCH /profile` - Update profile/preferences (protected).

## Medicines (`/api/medicines`) (protected)
- `GET /` - List user medicines.
- `POST /` - Create medicine.
- `PUT /:id` - Update medicine.
- `DELETE /:id` - Delete medicine.
- `POST /reschedule-reminders` - Recompute and reschedule reminders.

## Dashboard (`/api/dashboard`) (protected)
- `GET /` - Aggregate dashboard metrics and trends.

## Reminders (`/api/reminders`) (protected)
- `GET /` - List reminder logs.
- `PUT /:id/acknowledge` - Mark reminder acknowledged.

## Pharmacy (`/api/pharmacy`)
- `GET /products` - Get product catalog (protected).
- `POST /orders` - Place order (protected).
- `GET /orders` - Get all orders (protected + admin).
- `PUT /orders/:id/status` - Update order status (protected + admin).

## Push (`/api/push`) (protected)
- `POST /subscribe` - Save browser push subscription.
- `DELETE /unsubscribe` - Remove push subscription.

## Test/Admin utility (`/api/test`)
- `POST /trigger-stock-expiry` - Manually trigger stock/expiry scan (admin).

## Assistant (`/api/assistant`)
- `POST /chat` - SSE streaming AI assistant endpoint with tool actions.

---

## 5) React Components and Their Roles

## App shell, routing, and auth
- `src/App.tsx` - Central route table + guarded route wrappers.
- `src/contexts/AuthContext.tsx` - Session state, token hydration, auth actions.
- `src/components/Layout.tsx` - Global app layout/navigation.

## Auth pages
- `src/pages/Login.tsx` - Login form and auth entry.
- `src/pages/Register.tsx` - Account creation UI.

## Medicines workflow
- `src/pages/Medicines.tsx` - Medicines list and status indicators.
- `src/pages/AddMedicine.tsx` - Create medicine flow with validation.
- `src/pages/EditMedicine.tsx` - Update existing medicine details.
- `src/components/MedicineAutocomplete.tsx` - Search/select medicine name from list.
- `src/components/TimePicker.tsx` - Multi-time medicine schedule picker.

## Reminders & dashboard
- `src/pages/Reminders.tsx` - Reminder log view and acknowledgement actions.
- `src/pages/Dashboard.tsx` - Overview KPIs/charts/recent activity.

## Pharmacy/admin
- `src/pages/Pharmacy.tsx` - Product browsing, cart, checkout.
- `src/components/AdminDashboard.tsx` - Admin order management panel.

## Settings & notifications
- `src/pages/Settings.tsx` - Profile/preferences and push subscription controls.
- `public/sw.js` - Service worker push message handling.

## AI assistant
- `src/pages/Assistant.tsx` - Chat UI with streamed responses and backend tool effects.

---

## 6) Implemented and Working Features

- JWT-based authentication (register/login/me/logout) with protected routes.
- User profile updates, including notification preferences and phone number.
- Medicine management (create, list, edit, delete).
- Reminder engine with Agenda:
  - Scheduled reminders by medicine times.
  - Follow-up nudges for unacknowledged reminders.
  - Recurring next-day scheduling.
- Reminder logs and manual acknowledgment.
- Dashboard analytics (medicine counts, stock/expiry indicators, adherence trend).
- Daily stock/expiry scan job.
- Multi-channel notifications:
  - Push notifications (web push + service worker),
  - Email notifications,
  - SMS notifications.
- Pharmacy flow:
  - Product listing,
  - Cart and order placement,
  - Admin status updates.
- AI assistant endpoint and UI with medicine-related action tools.

---

## 7) Partially Implemented / Broken / Risk Areas

- Secrets appear stored in real `.env` files (`backend/.env`, `frontend/.env`), which is a security and operational risk if ever committed/shared.
- `frontend/.env.example` appears missing while setup docs expect it.
- README implementation drift in a few places:
  - Email service docs mention one provider, while runtime email sender uses Nodemailer/Gmail path.
  - CORS/env usage in docs does not fully match hardcoded origin handling in server code.
- `AdminDashboard` sends some order tracking fields that are not persisted by current order schema/update handler.
- `EditMedicine` currently fetches all medicines and filters client-side for one record; functional but not optimal at scale.
- Automated test setup is incomplete (`backend` test script is placeholder, minimal/no test suite coverage).
- `main.tsx` toaster mounting pattern may be incorrect (toast UI reliability risk).

---

## 8) Environment Variables and Config Files

## Backend env variables
From `backend/.env.example`, validation module, and runtime usages:

- Core required:
  - `PORT`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`

- Optional/feature flags:
  - `NODE_ENV`
  - `RENDER_EXTERNAL_URL`
  - `GMAIL_USER`
  - `GMAIL_APP_PASSWORD`
  - `RESEND_API_KEY`
  - `SENDGRID_API_KEY`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE`
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL`

## Frontend env variables
- `VITE_API_URL` - API base URL.
- `VITE_VAPID_PUBLIC_KEY` - Browser push subscription key.

## Important config files
- Backend:
  - `backend/config/db.js`
  - `backend/config/agenda.js`
  - `backend/config/validateEnv.js`
- Frontend:
  - `frontend/vite.config.ts`
  - `frontend/tailwind.config.cjs`
  - `frontend/postcss.config.cjs`
  - `frontend/tsconfig.json`

---

## 9) Current Authentication Setup

- Auth type: stateless JWT bearer tokens.
- Token generation:
  - Issued in auth controller on register/login.
  - Signed using `JWT_SECRET` with 7-day expiry.
- Backend auth enforcement:
  - `protect` middleware validates bearer token and loads current user.
  - `admin` middleware enforces role-based access for admin routes.
- Frontend auth flow:
  - Token stored in localStorage.
  - Axios request interceptor adds `Authorization` header.
  - 401 responses trigger logout/session reset.
  - Route guards restrict protected/admin/public pages.

---

## 10) Third-Party Services / APIs in Use

- MongoDB (data persistence via Mongoose).
- Agenda (persistent background scheduler on MongoDB).
- Web Push (`web-push` + VAPID keys) for browser notifications.
- Twilio API for SMS delivery.
- Gmail SMTP via Nodemailer for email delivery (with alternative packages installed).
- Google Gemini API for AI assistant chat/tool calling.
- UI/data libraries: React Query, Recharts, Tailwind ecosystem, etc.

---

## Notes

- This overview reflects current implementation state in code, not just README intent.
- A useful next hardening pass would prioritize: env secret rotation, docs/code alignment, schema consistency for admin order tracking, and baseline automated tests.
