# MedAlert — Smart Medicine Reminder & Stock Tracker

A comprehensive MERN stack application that helps users manage their medications with smart reminders, stock tracking, and adherence monitoring.

## 🚀 Features

### Core Functionality

- **Medicine Management**: Add, edit, and delete medications with detailed information
- **Smart Reminders**: Automated dose reminders via email, SMS, and push notifications
- **Stock Tracking**: Monitor medication inventory with low-stock alerts
- **Expiry Alerts**: Get notified when medications are about to expire
- **Adherence Dashboard**: Track medication adherence with visual charts and statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### User Experience

- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS
- **Real-time Updates**: Live data synchronization across all components
- **Authentication**: Secure JWT-based authentication system
- **Data Visualization**: Interactive charts showing adherence trends and statistics

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Agenda.js** for job scheduling
- **SendGrid** for email notifications
- **Twilio** for SMS notifications
- **Web Push** for browser notifications

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Axios** for API communication

## 📁 Project Structure

```
medalert/
├── backend/
│   ├── config/          # Database and agenda configuration
│   ├── controllers/      # Route controllers
│   ├── jobs/            # Background job definitions
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
└── frontend/
    ├── src/
    │   ├── components/  # Reusable React components
    │   ├── contexts/     # React contexts (Auth)
    │   ├── pages/        # Page components
    │   ├── services/     # API service functions
    │   └── App.tsx       # Main app component
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- SendGrid account (for email notifications)
- Twilio account (for SMS notifications)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd medalert/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/medalert
JWT_SECRET=your_jwt_secret_here
SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

4. Start the backend server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd medalert/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📱 Usage

### Getting Started

1. **Register**: Create a new account with your email and password
2. **Add Medicines**: Add your medications with dosage, schedule, and stock information
3. **Set Reminders**: Configure notification preferences (email, SMS, push)
4. **Track Adherence**: Monitor your medication adherence through the dashboard

### Key Features

#### Medicine Management

- Add medicines with name, dosage, schedule, stock count, and expiry date
- Edit medicine details and schedules
- Delete medicines when no longer needed
- View storage notes and special instructions

#### Smart Reminders

- Automatic dose reminders at scheduled times
- Multiple notification channels (email, SMS, push)
- Reminder acknowledgment tracking
- Overdue medication alerts

#### Dashboard Analytics

- Visual adherence trends over time
- Stock level monitoring
- Expiry date tracking
- Recent reminder history

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Medicines

- `GET /api/medicines` - Get all user medicines
- `POST /api/medicines` - Create new medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics

### Reminders

- `GET /api/reminders` - Get user reminders
- `PUT /api/reminders/:id/acknowledge` - Acknowledge reminder

## 🎨 UI Components

The application features a modern, responsive design with:

- **Clean Layout**: Sidebar navigation with main content area
- **Interactive Charts**: Line charts for trends, pie charts for adherence
- **Status Indicators**: Color-coded alerts for stock and expiry
- **Mobile-First**: Responsive design that works on all devices
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or use a cloud MongoDB service
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment

1. Build the production bundle:

```bash
npm run build
```

2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Icons by Lucide React
- Charts by Recharts
- Styling with Tailwind CSS

---

**MedAlert** - Making medication management simple and effective! 💊
