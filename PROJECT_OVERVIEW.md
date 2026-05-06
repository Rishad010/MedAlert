# MedAlert - Project Overview

## 1. Project Folder Structure

```
medalert/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline
├── backend/
│   ├── config/
│   │   ├── agenda.js                 # Agenda job scheduler configuration
│   │   ├── db.js                     # MongoDB connection setup
│   │   └── validateEnv.js            # Environment variables validation
│   ├── controllers/
│   │   ├── adminController.js        # Admin dashboard operations
│   │   ├── authController.js         # Authentication logic
│   │   ├── dashboardController.js    # User dashboard analytics
│   │   ├── medicineController.js     # Medicine CRUD operations
│   │   ├── pharmacyController.js   # Pharmacy/ordering logic
│   │   └── reminderController.js   # Reminder management
│   ├── data/
│   │   └── medicineDatabase.json     # Medicine reference data
│   ├── jobs/
│   │   ├── checkStockExpiry.js     # Scheduled stock/expiry check job
│   │   └── sendReminder.js         # Reminder notification job
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT authentication middleware
│   │   ├── errorMiddleware.js      # Global error handling
│   │   └── validationMiddleware.js # Input validation rules
│   ├── models/
│   │   ├── Medicine.js               # Medicine schema
│   │   ├── Order.js                  # Pharmacy order schema
│   │   ├── Prescription.js           # Prescription upload schema
│   │   ├── Product.js                # Pharmacy product schema
│   │   ├── ReminderLog.js            # Reminder log schema
│   │   └── User.js                   # User schema
│   ├── routes/
│   │   ├── adminRoutes.js            # Admin API routes
│   │   ├── assistantRoutes.js        # AI assistant routes
│   │   ├── authRoutes.js             # Authentication routes
│   │   ├── dashboardRoutes.js        # Dashboard routes
│   │   ├── medicineRoutes.js         # Medicine CRUD routes
│   │   ├── pharmacyRoutes.js         # Pharmacy routes
│   │   ├── pushRoutes.js             # Push notification routes
│   │   ├── reminderRoutes.js         # Reminder routes
│   │   └── testRoutes.js             # Admin test trigger routes
│   ├── scripts/
│   │   ├── seedAdmin.js              # Seed admin user script
│   │   └── seedProducts.js           # Seed pharmacy products script
│   ├── utils/
│   │   ├── assistantMedicineActions.js # AI assistant tool actions
│   │   ├── logger.js                 # Winston logger configuration
│   │   ├── scheduleReminders.js      # Reminder scheduling utilities
│   │   ├── sendEmail.js              # Email sending utility
│   │   ├── sendPush.js               # Push notification utility
│   │   └── sendSMS.js                # SMS sending utility
│   ├── .env                          # Environment variables (not tracked)
│   ├── .env.example                  # Environment variables template
│   ├── ecosystem.config.cjs          # PM2 configuration
│   ├── jest.config.js                # Jest test configuration
│   ├── package.json                  # Backend dependencies
│   ├── server.js                     # Main Express server entry
│   └── worker.js                     # Separate Agenda worker process
├── frontend/
│   ├── public/
│   │   ├── sw.js                     # Service worker for push notifications
│   │   ├── vercel.json               # Vercel deployment config
│   │   └── vite.svg                  # Vite logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx    # Admin dashboard component
│   │   │   ├── BackToLanding.tsx     # Navigation back button
│   │   │   ├── Layout.tsx            # App layout wrapper
│   │   │   ├── MedicineAutocomplete.tsx # Medicine search dropdown
│   │   │   └── TimePicker.tsx        # Custom time picker component
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # React auth context provider
│   │   ├── data/
│   │   │   └── medicineNames.ts      # Medicine name constants
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminAnalytics.tsx   # Admin analytics page
│   │   │   │   ├── AdminLayout.tsx      # Admin layout wrapper
│   │   │   │   ├── AdminOrders.tsx      # Admin orders management
│   │   │   │   ├── AdminOverview.tsx    # Admin overview dashboard
│   │   │   │   ├── AdminStockAlerts.tsx # Admin stock alerts page
│   │   │   │   └── AdminUsers.tsx       # Admin user management
│   │   │   ├── AddMedicine.tsx       # Add medicine form page
│   │   │   ├── Assistant.tsx         # AI assistant chat page
│   │   │   ├── Dashboard.tsx         # User dashboard page
│   │   │   ├── EditMedicine.tsx      # Edit medicine form page
│   │   │   ├── ForgotPassword.tsx    # Forgot password page
│   │   │   ├── Landing.tsx           # Marketing landing page
│   │   │   ├── Login.tsx             # Login page
│   │   │   ├── Medicines.tsx         # Medicine list page
│   │   │   ├── Pharmacy.tsx          # Pharmacy/shop page
│   │   │   ├── Register.tsx          # Registration page
│   │   │   ├── Reminders.tsx         # Reminders history page
│   │   │   ├── ResetPassword.tsx     # Password reset page
│   │   │   └── Settings.tsx          # User settings page
│   │   ├── services/
│   │   │   └── api.ts                # API client and endpoints
│   │   ├── tests/
│   │   │   ├── Login.test.tsx        # Login component tests
│   │   │   └── setup.ts              # Test setup configuration
│   │   ├── utils/
│   │   │   ├── currentStockValidation.ts # Stock validation utility
│   │   │   └── dosageValidation.ts   # Dosage validation utility
│   │   ├── App.tsx                   # Main React app component
│   │   ├── main.tsx                  # React app entry point
│   │   ├── style.css                 # Global styles
│   │   └── typescript.svg            # TypeScript logo
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # Frontend dependencies
│   ├── postcss.config.cjs            # PostCSS configuration
│   ├── tailwind.config.cjs           # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── vite.config.ts                # Vite configuration
├── .gitignore                        # Git ignore rules
├── README.md                         # Project documentation
└── PROJECT_OVERVIEW.md               # This file
```

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI library |
| TypeScript | ~5.9.3 | Type safety |
| Vite | ^7.1.7 | Build tool / dev server |
| Tailwind CSS | ^3.4.18 | Styling framework |
| React Router DOM | ^7.9.4 | Client-side routing |
| React Query (TanStack) | ^5.90.5 | Server state management |
| Axios | ^1.13.2 | HTTP client |
| Zod | ^4.3.6 | Schema validation |
| React Hook Form | ^7.65.0 | Form handling |
| Recharts | ^3.3.0 | Data visualization |
| Lucide React | ^0.546.0 | Icon library |
| React Hot Toast | ^2.6.0 | Notifications |
| date-fns | ^4.1.0 | Date utilities |
| React Time Picker | ^8.0.2 | Time input component |
| React Markdown | ^10.1.0 | Markdown rendering |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | ^5.1.0 | Web framework |
| Mongoose | ^8.19.2 | MongoDB ODM |
| Agenda | ^5.0.0 | Job scheduling |
| bcryptjs | ^3.0.2 | Password hashing |
| JWT (jsonwebtoken) | ^9.0.2 | Authentication tokens |
| dotenv | ^17.2.3 | Environment variables |
| Helmet | ^8.1.0 | Security headers |
| CORS | ^2.8.5 | Cross-origin requests |
| Morgan | ^1.10.1 | HTTP request logging |
| Winston | ^3.19.0 | Logging |
| Express Rate Limit | ^8.1.0 | Rate limiting |
| Express Validator | ^7.3.1 | Input validation |

### Database
- **MongoDB** - Document database for storing users, medicines, orders, reminders

### Third-Party Services & APIs
| Service | Purpose |
|---------|---------|
| Nodemailer + Gmail/SendGrid/Resend | Email notifications |
| Twilio | SMS notifications |
| Web Push (VAPID) | Browser push notifications |
| Google Gemini AI | AI assistant chat |

### Testing
| Tool | Purpose |
|------|---------|
| Jest | Backend testing |
| Supertest | HTTP assertion library |
| Vitest | Frontend testing |
| React Testing Library | Component testing |
| mongodb-memory-server | In-memory test database |

### DevOps
| Tool | Purpose |
|------|---------|
| GitHub Actions | CI/CD pipeline |
| PM2 (ecosystem.config.cjs) | Process management |

---

## 3. API Routes / Endpoints

### Authentication (`/api/auth`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login and receive JWT |
| POST | `/forgot-password` | No | Request password reset |
| POST | `/reset-password` | No | Reset password with token |
| GET | `/me` | Yes | Get current user profile |
| PATCH | `/profile` | Yes | Update profile & notification preferences |

### Medicines (`/api/medicines`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| GET | `/` | Yes | List all medicines for user |
| POST | `/` | Yes | Create new medicine |
| GET | `/:id` | Yes | Get medicine by ID |
| PUT | `/:id` | Yes | Update medicine |
| DELETE | `/:id` | Yes | Delete medicine |
| POST | `/reschedule-reminders` | Yes | Rebuild all reminder jobs |

### Dashboard (`/api/dashboard`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| GET | `/` | Yes | Get dashboard KPIs and trends |

### Reminders (`/api/reminders`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| GET | `/` | Yes | Get all reminder logs/history |
| PUT | `/:id/acknowledge` | Yes | Mark reminder as taken |

### Pharmacy (`/api/pharmacy`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| GET | `/products` | Yes | Get pharmacy product catalog |
| POST | `/orders` | Yes | Place new order |
| GET | `/orders` | Yes + Admin | List all orders (admin only) |
| PUT | `/orders/:id/status` | Yes + Admin | Update order status & tracking |

### Push Notifications (`/api/push`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| POST | `/subscribe` | Yes | Save push subscription |
| DELETE | `/unsubscribe` | Yes | Remove push subscription |

### Admin (`/api/admin`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| GET | `/stats` | Yes + Admin | Get admin statistics |
| GET | `/users` | Yes + Admin | List all users |
| PATCH | `/users/:id/status` | Yes + Admin | Toggle user active status |
| GET | `/orders` | Yes + Admin | Get all pharmacy orders |
| GET | `/stock-alerts` | Yes + Admin | Get medicine stock alerts |
| GET | `/analytics` | Yes + Admin | Get platform analytics |

### AI Assistant (`/api/assistant`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| POST | `/chat` | Yes | Stream chat with Gemini AI |

### Test (`/api/test`)
| Method | Path | Auth Required | Purpose |
|--------|------|---------------|---------|
| POST | `/trigger-stock-expiry` | Yes + Admin | Manually trigger stock/expiry check |

---

## 4. Database Schema / Mongoose Models

### User Collection (`users`)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ["user", "admin"], default: "user"),
  isActive: Boolean (default: true),
  notifications: {
    email: Boolean (default: true),
    push: Boolean (default: false),
    sms: Boolean (default: false)
  },
  pushSubscription: Object,           // Web push subscription data
  phone: String,                      // Phone number for SMS
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Medicine Collection (`medicines`)
```javascript
{
  user: ObjectId (ref: "User", required),
  name: String (required),
  dosage: String (required),          // e.g., "1 tablet", "5ml"
  schedule: String (required),        // e.g., "8:00 AM, 8:00 PM"
  stock: Number (required),
  expiryDate: Date (required),
  storageNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection (`orders`)
```javascript
{
  user: ObjectId (ref: "User"),
  customerName: String,
  phone: String,
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String
  },
  items: [{
    product: ObjectId (ref: "Product"),
    sku: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentMethod: String (default: "COD"),
  status: String (enum: ["Received", "Packed", "Shipped", "Delivered"], default: "Received"),
  tracking: {
    courier: String,
    trackingId: String
  },
  prescription: ObjectId (ref: "Prescription"),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection (`products`)
```javascript
{
  sku: String (required, unique),
  name: String (required),
  strength: String,                   // e.g., "500mg"
  form: String,                       // tablet, syrup, capsule
  price: Number (required),
  prescriptionRequired: Boolean (default: false),
  stockQty: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Prescription Collection (`prescriptions`)
```javascript
{
  user: ObjectId (ref: "User"),
  fileUrl: String (required),
  verified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### ReminderLog Collection (`reminderlogs`)
```javascript
{
  user: ObjectId (ref: "User", required),
  medicine: ObjectId (ref: "Medicine", required),
  sentAt: Date (default: Date.now),
  status: String (enum: ["sent", "failed"], default: "sent"),
  channel: String (default: "console"),
  acknowledged: Boolean (default: false),
  acknowledgedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. Frontend Pages & Components

### Pages

| Page | File | Purpose |
|------|------|---------|
| **Landing** | `pages/Landing.tsx` | Marketing page with features, testimonials, CTA |
| **Login** | `pages/Login.tsx` | User login form with validation |
| **Register** | `pages/Register.tsx` | User registration form |
| **Forgot Password** | `pages/ForgotPassword.tsx` | Password reset request |
| **Reset Password** | `pages/ResetPassword.tsx` | Password reset confirmation |
| **Dashboard** | `pages/Dashboard.tsx` | User dashboard with KPIs, adherence chart, stock alerts |
| **Medicines** | `pages/Medicines.tsx` | List all medicines with search/filter |
| **Add Medicine** | `pages/AddMedicine.tsx` | Form to add new medicine with autocomplete |
| **Edit Medicine** | `pages/EditMedicine.tsx` | Form to edit existing medicine |
| **Reminders** | `pages/Reminders.tsx` | View reminder history and acknowledge doses |
| **Pharmacy** | `pages/Pharmacy.tsx` | Shop for medicines, cart, checkout |
| **Assistant** | `pages/Assistant.tsx` | AI chat assistant for medicine help |
| **Settings** | `pages/Settings.tsx` | User profile and notification preferences |

### Admin Pages

| Page | File | Purpose |
|------|------|---------|
| **Admin Overview** | `pages/admin/AdminOverview.tsx` | Admin dashboard with stats |
| **Admin Users** | `pages/admin/AdminUsers.tsx` | User management (activate/deactivate) |
| **Admin Orders** | `pages/admin/AdminOrders.tsx` | Order management and tracking |
| **Admin Stock Alerts** | `pages/admin/AdminStockAlerts.tsx` | View all low stock/expiry alerts |
| **Admin Analytics** | `pages/admin/AdminAnalytics.tsx` | Platform analytics charts |

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **Layout** | `components/Layout.tsx` | App shell with navigation, handles auth |
| **AdminDashboard** | `components/AdminDashboard.tsx` | Admin stats cards and charts |
| **MedicineAutocomplete** | `components/MedicineAutocomplete.tsx` | Searchable dropdown for medicine names |
| **TimePicker** | `components/TimePicker.tsx` | Custom time selection input |
| **BackToLanding** | `components/BackToLanding.tsx` | Navigation button to return home |

### Contexts

| Context | File | Purpose |
|---------|------|---------|
| **AuthContext** | `contexts/AuthContext.tsx` | Authentication state and methods |

---

## 6. Environment Variables

### Backend (`backend/.env`)
```bash
# Server
PORT                    # Server port (default: 5000)
NODE_ENV                # Environment (development/production/test)

# Database
MONGO_URI               # MongoDB connection string

# Authentication
JWT_SECRET              # JWT signing secret

# Frontend URL (CORS)
CLIENT_URL              # Frontend domain for CORS

# Web Push (VAPID)
VAPID_PUBLIC_KEY        # VAPID public key for push notifications
VAPID_PRIVATE_KEY       # VAPID private key
VAPID_SUBJECT           # Contact email (mailto:)

# Email (Gmail)
GMAIL_USER              # Gmail address
GMAIL_APP_PASSWORD      # Gmail app password

# OR Email (OAuth2)
GMAIL_CLIENT_ID         # Google OAuth client ID
GMAIL_CLIENT_SECRET     # Google OAuth client secret
GMAIL_REFRESH_TOKEN     # Google OAuth refresh token

# Alternative Email Providers
SENDGRID_API_KEY        # SendGrid API key
RESEND_API_KEY          # Resend API key

# SMS (Twilio)
TWILIO_ACCOUNT_SID      # Twilio account SID
TWILIO_AUTH_TOKEN       # Twilio auth token
TWILIO_PHONE            # Twilio phone number

# AI
GEMINI_API_KEY          # Google Gemini API key
GEMINI_MODEL            # Gemini model name (optional)

# Deployment
RENDER_EXTERNAL_URL     # Render deployment URL (for keep-alive)
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL            # Backend API URL (e.g., http://localhost:5000/api)
VITE_VAPID_PUBLIC_KEY   # VAPID public key for push subscriptions
```

---

## 7. External Services Integrated

| Service | Type | Purpose |
|---------|------|---------|
| **MongoDB Atlas** | Database | Cloud MongoDB hosting |
| **Gmail SMTP** | Email | Send reminder emails |
| **SendGrid** | Email | Alternative email provider |
| **Resend** | Email | Alternative email provider |
| **Twilio** | SMS | Send reminder SMS messages |
| **Web Push (VAPID)** | Push | Browser push notifications |
| **Google Gemini AI** | AI | Chat assistant for medicine queries |
| **Render** | Hosting | Backend deployment platform |
| **Vercel** | Hosting | Frontend deployment platform |

---

## 8. Current Features (Working)

### Authentication
- [x] User registration with validation
- [x] User login with JWT tokens
- [x] Password reset (forgot/reset flow)
- [x] Role-based access (user/admin)
- [x] Protected routes middleware

### Medicine Management
- [x] Add medicines with autocomplete
- [x] Edit medicine details
- [x] Delete medicines
- [x] View all medicines
- [x] Stock tracking
- [x] Expiry date tracking
- [x] Storage notes

### Reminders
- [x] Scheduled daily reminders (Agenda)
- [x] Multi-time schedule per medicine
- [x] Acknowledge doses (mark as taken)
- [x] Reminder history/log

### Notifications
- [x] Email reminders (Nodemailer)
- [x] SMS reminders (Twilio)
- [x] Browser push notifications (VAPID)
- [x] Per-channel toggle preferences

### Dashboard
- [x] Adherence trend chart
- [x] Upcoming doses display
- [x] Low stock alerts
- [x] Expiry warnings
- [x] KPI cards (total medicines, today's doses, etc.)

### AI Assistant
- [x] Gemini-powered chat
- [x] Medicine context awareness
- [x] Tool actions (create/update medicines via chat)
- [x] Streaming SSE responses

### Pharmacy
- [x] Product catalog browsing
- [x] Shopping cart
- [x] Order placement (COD)
- [x] Prescription upload reference

### Admin Panel
- [x] Admin dashboard overview
- [x] User management (view, toggle status)
- [x] Order management (view, update status, tracking)
- [x] Stock alerts view
- [x] Analytics charts

### Testing
- [x] Backend tests (Jest + Supertest)
- [x] Frontend tests (Vitest + RTL)
- [x] GitHub Actions CI pipeline

---

## 9. Incomplete / TODO Features

### High Priority
- [ ] Real prescription file upload (currently URL reference only)
- [ ] Online payment integration (currently COD only)
- [ ] Push notification delivery confirmation tracking
- [ ] SMS delivery status tracking

### Medium Priority
- [ ] Medicine interaction checker
- [ ] Refill reminders (when stock low)
- [ ] Family/caretaker mode (manage multiple users)
- [ ] Medicine barcode scanning
- [ ] Voice reminder option

### Low Priority / Nice to Have
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Export medication history to PDF
- [ ] Doctor/patient connection feature
- [ ] Telemedicine integration
- [ ] Wearable device integration

---

## 10. How to Run Locally

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas URI)
- Git

### Step 1: Clone & Navigate
```bash
git clone <repository-url>
cd medalert
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env with your values (MongoDB URI, JWT secret, API keys)

# Seed admin user (optional)
npm run seed:admin

# Seed pharmacy products (optional)
npm run seed

# Start development server
npm run dev
```

### Step 3: Worker Setup (Separate Terminal)
```bash
cd backend

# Start the Agenda worker process
npm run dev:worker
```

### Step 4: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:5000/api
# VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

# Start development server
npm run dev
```

### Step 5: Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/

### Generate VAPID Keys (for push notifications)
```bash
npx web-push generate-vapid-keys
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## Summary

**MedAlert** is a full-featured MERN stack medication management application with:
- Complete user authentication system
- Medicine CRUD with smart reminders
- Multi-channel notifications (Email, SMS, Push)
- AI-powered assistant chat
- Built-in pharmacy ordering
- Admin management panel
- Comprehensive test coverage
- Production-ready deployment configs
