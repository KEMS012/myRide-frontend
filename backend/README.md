# MyRyde Backend API

A Node.js + Express backend that works alongside your existing Firebase project.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend` folder based on `.env.example`:
   ```env
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   PORT=5000
   ```

3. Get Firebase service account credentials:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key
   - Copy the `project_id`, `client_email`, and `private_key` into your `.env`

4. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google sign-in
- `POST /api/auth/reset-password` - Send password reset email
- `POST /api/auth/logout` - Logout (revoke refresh tokens)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Rides
- `POST /api/rides` - Create ride
- `GET /api/rides` - Get rides (query: userId, driverId, status)
- `GET /api/rides/:id` - Get ride by ID
- `PUT /api/rides/:id/status` - Update ride status
- `POST /api/rides/:id/accept` - Accept ride
- `POST /api/rides/:id/reject` - Reject ride
- `POST /api/rides/:id/complete` - Complete ride
- `DELETE /api/rides/:id` - Delete ride

### Schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules` - Get schedules (query: userId, status)
- `DELETE /api/schedules/:id` - Delete schedule

### Partners
- `POST /api/partners` - Create partner
- `GET /api/partners` - Get all partners
- `PUT /api/partners/:id` - Update partner
- `DELETE /api/partners/:id` - Delete partner

### Programs
- `POST /api/programs` - Create program
- `GET /api/programs` - Get all programs
- `PUT /api/programs/:id/status` - Update program status

### Notifications
- `GET /api/notifications` - Get notifications for current user
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark notification as read

### Rewards
- `GET /api/rewards/:userId` - Get user reward
- `POST /api/rewards` - Create/update reward

## Frontend Integration

The frontend currently works directly with Firebase and will continue to work without changes.

To integrate with the backend API later, update your API service layer to make HTTP requests to `http://localhost:5000/api/...` instead of calling Firebase directly.
