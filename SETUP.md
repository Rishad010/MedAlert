## Running the project

### Development
```bash
cd backend
npm run dev:all      # starts API + worker together with colour-coded logs
```

### Production (PM2)
```bash
cd backend
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save             # persists across server reboots
pm2 logs             # watch live logs from both processes
```

### Why two processes?
The API (`server.js`) handles HTTP requests.  
The worker (`worker.js`) runs background jobs — dose reminders and stock/expiry checks.  
**Both must be running** for the reminder and alert features to work.

# Environment Setup Script for MedAlert

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/medalert
JWT_SECRET=your_super_secret_jwt_key_here
SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
```

## Quick Start Commands

### Backend

```bash
cd medalert/backend
npm install
npm run dev
```

### Frontend

```bash
cd medalert/frontend
npm install
npm run dev
```

## External Services Setup

### MongoDB

- Install MongoDB locally or use MongoDB Atlas
- Update MONGO_URI in backend/.env

### SendGrid (Email Notifications)

- Sign up at https://sendgrid.com/
- Create an API key
- Add SENDGRID_API_KEY to backend/.env

### Twilio (SMS Notifications)

- Sign up at https://www.twilio.com/
- Get Account SID, Auth Token, and Phone Number
- Add credentials to backend/.env

### Web Push (Browser Notifications)

- Generate VAPID keys using: `npx web-push generate-vapid-keys`
- Add keys to backend/.env
