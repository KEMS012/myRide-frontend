# MyRyde Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [How MyRyde Works](#how-myryde-works)
3. [User Roles](#user-roles)
4. [Getting Started](#getting-started)
5. [Passenger Guide](#passenger-guide)
6. [Driver Guide](#driver-guide)
7. [Partner Guide](#partner-guide)
8. [Admin Guide](#admin-guide)
9. [Booking Flow](#booking-flow)
10. [Payment Integration](#payment-integration)
11. [Notifications](#notifications)
12. [Calendar Integration](#calendar-integration)
13. [Emergency & Support](#emergency--support)
14. [Firebase Structure](#firebase-structure)
15. [Deployment](#deployment)

---

## Introduction

MyRyde is a comprehensive ride-hailing and transportation platform designed for Ogbomoso and surrounding communities. The platform connects passengers with verified drivers, supports church and school partnerships, and provides admin oversight for safe, reliable transportation.

### Key Features
- Real-time ride booking and scheduling
- Driver availability tracking
- Google Calendar integration
- Paystack payment processing
- Real-time notifications
- Emergency contacts and support
- Driver verification and KYC
- Partner management for churches and schools

---

## How MyRyde Works

### Architecture Overview

MyRyde uses a modern React frontend with Firebase backend:

```
┌─────────────────────────────────────────────────────────────┐
│                     MyRyde Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Passenger  │    │    Driver   │    │    Admin    │     │
│  │  Dashboard  │    │  Dashboard  │    │  Dashboard  │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │   Firebase     │                        │
│                    │  - Auth        │                        │
│                    │  - Firestore   │                        │
│                    │  - Storage     │                        │
│                    └────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Passenger** creates a booking request
2. **Firestore** stores the booking in real-time
3. **Driver** receives notification of new booking
4. **Driver** accepts/declines the booking
5. **Admin** receives notification of all bookings
6. **Payment** is processed via Paystack
7. **Calendar** events are created for both parties
8. **Notifications** update all parties in real-time

---

## User Roles

### Passenger (Rider)
- Browse available drivers
- Book rides instantly or schedule in advance
- View ride history and upcoming trips
- Make payments via Paystack
- Add rides to Google Calendar
- Rate drivers after trips
- Access emergency contacts

### Driver
- Set availability status
- Receive booking notifications
- View assigned rides
- Accept or decline bookings
- Update ride status
- Add rides to Google Calendar
- View passenger information

### Partner
- Manage church and school partnerships
- View partnership programs
- Track rider base statistics
- Monitor partnership revenue
- Create and manage programs

### Admin
- Manage all users (passengers, drivers, partners)
- Verify driver accounts and KYC
- View all bookings and rides
- Monitor platform statistics
- Manage partners and programs
- Access payment/transaction records
- Send notifications

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Firebase account with project created
- Paystack account for payments
- Google Calendar API credentials (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/KEMS012/MyRyde.git
cd MyRyde

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Passenger Guide

### 1. Registration & Login

#### Step 1: Create Account
1. Visit the MyRyde homepage
2. Click **"Sign Up"**
3. Fill in your details:
   - Full Name
   - Phone Number
   - Email Address
   - Password
4. Select **"I'm a Passenger"**
5. Accept Terms and Conditions
6. Click **"Create Account"**

#### Step 2: Email Verification
- Check your email for verification link
- Click the link to verify your account

#### Step 3: Login
1. Enter your email and password
2. Click **"Login"**
3. You'll be redirected to the Passenger Dashboard

### 2. Passenger Dashboard Overview

The dashboard shows:
- **Quick Stats**: Total rides, upcoming trips, reward points, wallet balance
- **Upcoming Rides**: Scheduled rides with driver info
- **Recent Activity**: Latest trip history
- **Rewards Progress**: Points and tier status

### 3. Booking a Ride

#### Instant Booking

1. Click **"Book a Ride"** in the sidebar
2. Enter pickup location
3. Enter destination
4. Select ride type:
   - Standard Ride
   - Executive Ride
   - Fixed Ride
5. Choose **"Ride Now"**
6. Click **"Find Available Ride"**
7. Select a driver from available options
8. Proceed to payment
9. Confirm booking

#### Scheduled Booking

1. Click **"Book a Ride"**
2. Enter pickup and destination
3. Select ride type
4. Choose **"Schedule"**
5. Select date and time (must be 24+ hours in advance)
6. Click **"Find Available Ride"**
7. The system checks driver availability
8. Select a driver
9. Proceed to payment
10. Confirm booking

### 4. Available Drivers

1. Click **"Available Drivers"** in the sidebar
2. View list of verified, available drivers
3. Each driver card shows:
   - Profile photo
   - Name
   - Operating area
   - Vehicle type
   - Availability status
   - Call button
4. Click **"Call"** to contact driver directly
5. Click **"Book"** to book with that driver

### 5. My Trips

View all your ride history:
- **Completed**: Finished rides
- **Cancelled**: Cancelled bookings
- **Pending**: Awaiting confirmation
- **Confirmed**: Accepted by driver

Filter trips by status and search by location or date.

### 6. Scheduled Rides

View upcoming scheduled rides:
- Booking reference
- Driver name and photo
- Vehicle type
- Pickup and destination
- Date and time
- Status
- Payment status

Options:
- Add to Google Calendar
- Cancel ride
- Contact driver

### 7. Fixed Rides

Subscribe to a regular driver:
1. Click **"Fixed Rides"**
2. Browse available drivers
3. Click **"Subscribe"** on a driver
4. Choose plan:
   - Weekly
   - Monthly
5. Set schedule (e.g., Mon-Fri)
6. Confirm subscription

### 8. Rewards

Earn points for every ride:
- **Bronze**: 0-499 points
- **Silver**: 500-999 points
- **Gold**: 1000+ points

Points are awarded:
- 100 points per completed ride
- Bonus points for referrals
- Special promotions

### 9. Wallet

View your wallet balance and transaction history:
- Add funds
- View payment history
- Download receipts

### 10. Profile Management

Update your profile:
- Profile photo
- Full name
- Phone number
- Email address
- Home address
- Town/Area

### 11. Emergency Contacts

Add emergency contacts:
1. Click **"Emergency"** in sidebar
2. Enter contact name
3. Enter phone number
4. Click **"Add Contact"**
5. Quick call button available

Default contact: MyRyde Support (+234 808 591 9225)

### 12. Support Center

Get help:
- **Call Support**: Direct call to support line
- **Email Support**: Send support request
- **FAQ**: Common questions and answers
- **Report Issue**: Submit bug reports or complaints

### 13. Settings

Manage your preferences:
- Push notifications
- Email updates
- SMS ride alerts
- Share trip with contacts
- Location sharing toggle

---

## Driver Guide

### 1. Registration & Verification

#### Step 1: Create Account
1. Visit MyRyde homepage
2. Click **"Sign Up"**
3. Fill in your details
4. Select **"I'm a Driver"**
5. Complete driver-specific fields:
   - Vehicle type
   - License number
   - Vehicle plate number
   - NIN
   - BVN
   - Next of kin
   - Residential address
   - Years of experience
6. Submit for verification

#### Step 2: Admin Verification
- Admin reviews your documents
- You'll receive notification when approved
- Account status changes from "Pending" to "Active"

### 2. Driver Dashboard

#### Availability Toggle
- Toggle between **Online** and **Offline**
- When online, you receive ride requests
- When offline, no requests come through

#### Ride Requests
- View incoming ride requests
- See passenger name, pickup, destination, fare
- Accept or decline requests
- Real-time updates via Firestore

#### My Trips
- View all your rides
- Filter by status: All, Completed, Cancelled
- Mark rides as completed
- View passenger information

#### Schedule
- View upcoming scheduled rides
- See pickup/destination, time, passenger
- Remove unavailable slots

#### Ratings
- View passenger reviews
- See your average rating
- Read feedback comments

### 3. Booking Actions

#### Accept a Booking
1. Receive notification
2. Click notification to view booking
3. Click **"Accept"**
4. Navigate to pickup location
5. Update ride status to "In Progress"
6. Complete ride when done

#### Decline a Booking
1. Receive notification
2. Click **"Decline"**
3. Ride returns to available pool

#### Complete a Ride
1. Drop off passenger
2. Click **"Complete"** in My Trips
3. Passenger receives completion notification
4. Rating request sent to passenger

### 4. Driver Profile

Keep your profile updated:
- Profile photo
- Full name
- Phone number
- Email
- Vehicle details
- License number
- Vehicle plate number

---

## Partner Guide

### 1. Partner Registration

1. Sign up as a Partner
2. Fill in organization details
3. Submit for admin approval
4. Once approved, access Partner Dashboard

### 2. Partner Dashboard

#### Overview
- View partnership statistics
- Active riders count
- Rides this month
- Partner revenue

#### Churches
- View church partnerships
- See rider counts and ride history
- Contact information

#### Schools
- View school partnerships
- Track student transportation
- Program details

#### Programs
- Create partnership programs
- Set benefits for members
- Track enrollment
- Pause/activate programs

#### Rider Base
- View total riders
- Church riders breakdown
- School riders breakdown
- Retention rates

#### Trips
- View all partner-related trips
- Filter by partner type
- See revenue breakdown

#### Revenue
- Monthly revenue
- Payouts
- Trip counts
- Partner breakdown

### 3. Creating a Program

1. Click **"Programs"**
2. Click **"New Program"**
3. Enter program details:
   - Program name
   - Partner organization
   - Benefits
   - Rider capacity
4. Set status: Draft or Live
5. Save program

---

## Admin Guide

### 1. Admin Dashboard Overview

Real-time statistics:
- Total passengers
- Total drivers
- Available drivers
- Total bookings
- Pending bookings
- Completed rides
- Cancelled rides
- Revenue

### 2. User Management

#### View Users
1. Click **"Users"** in sidebar
2. View all registered users
3. Search by name, email, or role
4. Filter by role: Passenger, Driver, Partner

#### User Actions
- View user details
- Edit user information
- Change user status: Active, Suspended, Pending
- Delete user account
- View user's ride history

### 3. Driver Management

#### View Drivers
1. Click **"Drivers"** in sidebar
2. View all registered drivers
3. See verification status
4. View vehicle information

#### Driver Verification
1. Click on pending driver
2. Review submitted documents:
   - Vehicle photo
   - License
   - Vehicle plate number
   - NIN/BVN
3. Approve or reject verification
4. Driver receives notification

#### Driver Actions
- View driver details
- Edit driver information
- Update driver status
- View driver's rides
- Contact driver

### 4. Ride Management

#### View All Rides
1. Click **"Rides"** in sidebar
2. View all platform rides
3. Filter by status
4. Search by route or driver/passenger

#### Ride Actions
- View ride details
- Update ride status
- Assign driver
- Cancel ride
- View payment status

### 5. Partner Management

#### View Partners
1. Click **"Partners"** in sidebar
2. View all church and school partners
3. See partnership details

#### Partner Actions
- Add new partner
- Edit partner information
- Remove partner
- View partner's riders
- View partner's trips

### 6. Verification Queue

View pending verifications:
- Driver registration requests
- Document verification status
- Approval/rejection actions

### 7. Reports

View platform analytics:
- Daily/weekly/monthly bookings
- Revenue reports
- Driver performance
- Passenger trends
- Popular routes

### 8. Notifications

Receive real-time notifications for:
- New bookings
- Driver verifications
- System alerts
- Payment confirmations

Click notification to view details.

### 9. Settings

Configure platform settings:
- Support email
- Default fare rates
- Notification templates
- System preferences

---

## Booking Flow

### Complete Booking Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PASSENGER ACTION                                         │
│    - Login to account                                       │
│    - Browse available drivers                               │
│    - Select ride type                                       │
│    - Choose instant or scheduled                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BOOKING CREATION                                         │
│    - Enter pickup location                                  │
│    - Enter destination                                      │
│    - Select date/time (if scheduled)                        │
│    - System checks driver availability                      │
│    - Create booking in Firestore                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. DRIVER ASSIGNMENT                                        │
│    - System matches with available driver                   │
│    - Driver receives real-time notification                 │
│    - Booking status: "requested"                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PAYMENT PROCESSING                                       │
│    - Passenger proceeds to Paystack                         │
│    - Complete payment                                       │
│    - Payment verified                                       │
│    - Booking status: "paid"                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. RIDE EXECUTION                                           │
│    - Driver accepts booking                                 │
│    - Driver navigates to pickup                             │
│    - Ride status: "accepted"                                │
│    - Ride status: "in_progress"                             │
│    - Ride status: "completed"                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. POST-RIDE                                                │
│    - Passenger rates driver                                 │
│    - Driver receives rating                                 │
│    - Reward points added to passenger                       │
│    - Calendar event created                                 │
└─────────────────────────────────────────────────────────────┘
```

### Booking Status Values

| Status | Description |
|--------|-------------|
| `requested` | Booking created, awaiting driver |
| `accepted` | Driver accepted the booking |
| `in_progress` | Ride is currently happening |
| `completed` | Ride finished successfully |
| `cancelled` | Booking was cancelled |
| `rejected` | Driver declined the booking |

### Ride Types

| Type | Description |
|------|-------------|
| `Standard Ride` | Regular car/bike ride |
| `Executive Ride` | Premium vehicle |
| `Fixed Ride` | Scheduled recurring ride |

---

## Payment Integration

### Paystack Integration

MyRyde uses Paystack for secure payment processing.

#### Payment Flow

1. Passenger completes booking
2. System generates payment reference
3. Passenger redirected to Paystack checkout
4. Passenger enters card details
5. Paystack processes payment
6. Payment verified on backend
7. Booking updated to "paid"
8. Receipt generated

#### Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Payment initiated |
| `paid` | Payment successful |
| `failed` | Payment failed |
| `cancelled` | Payment cancelled |

#### Security Notes
- Paystack secret keys are NEVER exposed in frontend
- All payments use HTTPS
- Transaction references are logged
- Payment verification happens server-side

---

## Notifications

### Real-Time Notification System

MyRyde uses Firebase Firestore for real-time notifications.

#### Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| `new_booking` | New booking created | Driver, Admin |
| `booking_confirmed` | Booking accepted | Passenger |
| `ride_completed` | Ride finished | Passenger, Driver |
| `payment_received` | Payment successful | Passenger, Driver, Admin |
| `driver_verification` | New driver registered | Admin |
| `rating_received` | Driver got rated | Driver |

#### Notification Structure

```javascript
{
  id: "notification_id",
  recipientId: "user_uid",
  recipientRole: "driver|passenger|admin",
  bookingId: "booking_reference",
  title: "Notification title",
  message: "Detailed message",
  type: "notification_type",
  read: false,
  createdAt: timestamp
}
```

#### Notification UI

- Bell icon in top navigation
- Unread count badge
- Dropdown panel with notification list
- Click to view details
- Mark as read functionality

---

## Calendar Integration

### Google Calendar Integration

MyRyde generates Google Calendar event links for scheduled rides.

#### For Passengers

1. Book a scheduled ride
2. Click **"Add to Calendar"** on the booking
3. Opens Google Calendar with pre-filled event:
   - Title: "MyRyde Ride"
   - Date: Scheduled ride date
   - Time: Scheduled ride time
   - Location: Pickup address
   - Description: Driver, booking reference, destination

#### For Drivers

1. Accept a booking
2. Click **"Add to Calendar"** in schedule
3. Same event details as passenger

#### Calendar Event Details

```
Title: MyRyde Ride: Pickup → Destination
Date: [Scheduled Date]
Time: [Scheduled Time]
Location: [Pickup Address]
Description:
  Driver: [Driver Name]
  Passenger: [Passenger Name]
  Booking Reference: [Booking ID]
  Vehicle: [Vehicle Type]
  Ride Type: [Ride Type]
```

---

## Emergency & Support

### Emergency Contacts

Every passenger has access to emergency contacts:

1. Click **"Emergency"** in sidebar
2. View saved contacts
3. Quick call button for each contact
4. Add new emergency contacts

Default contact: MyRyde Support (+234 808 591 9225)

### Support Center

Access help and support:

1. Click **"Support"** in sidebar
2. Options:
   - **Call Support**: Direct call to support line
   - **Email Support**: Send support request
   - **FAQ**: Browse common questions
   - **Report Issue**: Submit bug reports

### FAQ Sections

- How to book a ride
- How to cancel a scheduled ride
- How to earn reward points
- Payment security
- Driver verification process
- Lost items policy
- Safety measures

---

## Firebase Structure

### Collections

#### `users`
Stores all user profiles (passengers, drivers, partners, admins).

```javascript
{
  uid: "user_unique_id",
  name: "Full Name",
  email: "email@example.com",
  phone: "+234 800 000 0000",
  role: "rider|driver|partner|admin",
  status: "Active|Pending|Suspended",
  avatar: "profile_image_url",
  town: "Ogbomoso",
  area: "Sabo",
  address: "Street address",
  vehicle: "Motorcycle",
  license: "DLN123456",
  plateNumber: "ABC-1234",
  rating: 4.5,
  ratingCount: 12,
  locationSharingEnabled: true,
  lastLocation: {
    latitude: 8.1324,
    longitude: 4.2434,
    accuracy: 10,
    updatedAt: "2026-08-06T10:00:00Z"
  },
  createdAt: timestamp
}
```

#### `rides`
Stores all booking/ride records.

```javascript
{
  userId: "passenger_uid",
  driverId: "driver_uid",
  riderName: "Passenger Name",
  driverName: "Driver Name",
  from: "Pickup Location",
  to: "Destination",
  route: "Pickup → Destination",
  type: "Standard Ride|Executive Ride|Fixed Ride",
  fare: "₦1,200",
  status: "requested|accepted|in_progress|completed|cancelled|rejected",
  scheduledAt: "2026-08-12T08:00:00Z",
  paymentStatus: "pending|paid|failed|cancelled",
  transactionReference: "paystack_ref",
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp
}
```

#### `schedules`
Stores scheduled ride bookings.

```javascript
{
  userId: "passenger_uid",
  from: "Pickup",
  to: "Destination",
  datetime: "2026-08-12T08:00:00Z",
  type: "Standard Ride",
  status: "scheduled|cancelled",
  createdAt: timestamp
}
```

#### `fixedRides`
Stores fixed ride subscriptions.

```javascript
{
  userId: "passenger_uid",
  driverId: "driver_uid",
  plan: "Weekly|Monthly",
  schedule: "Mon-Fri",
  status: "active|cancelled",
  createdAt: timestamp
}
```

#### `partners`
Stores church and school partnerships.

```javascript
{
  name: "LAUTECH",
  type: "School|Church",
  area: "LAUTECH",
  riders: 880,
  rides: 3100,
  contact: "Dean of Students",
  status: "Active|Inactive",
  createdAt: timestamp
}
```

#### `programs`
Stores partnership programs.

```javascript
{
  name: "Campus Commute Plan",
  partner: "LAUTECH",
  riders: 500,
  benefit: "10% discount",
  status: "Live|Draft|Paused",
  createdAt: timestamp
}
```

#### `rewards`
Stores passenger reward points and tiers.

```javascript
{
  userId: "passenger_uid",
  points: 750,
  ridesCount: 15,
  tier: "Bronze|Silver|Gold"
}
```

#### `notifications`
Stores real-time notifications.

```javascript
{
  recipientId: "user_uid",
  recipientRole: "driver|passenger|admin",
  bookingId: "booking_reference",
  title: "Notification title",
  message: "Detailed message",
  type: "new_booking|booking_confirmed|ride_completed|payment_received|driver_verification|rating_received",
  read: false,
  createdAt: timestamp
}
```

### Firestore Indexes

Required indexes for queries:

```
rides: userId ASC, createdAt DESC
rides: driverId ASC, createdAt DESC
rides: status ASC, createdAt ASC
schedules: userId ASC, datetime ASC
schedules: status ASC, datetime ASC
fixedRides: userId ASC, status ASC
notifications: recipientId ASC, createdAt DESC
users: role ASC, createdAt DESC
```

---

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy

### Environment Variables for Production

```env
VITE_FIREBASE_API_KEY=production_key
VITE_FIREBASE_AUTH_DOMAIN=production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=production_project
VITE_FIREBASE_STORAGE_BUCKET=production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id
VITE_FIREBASE_APP_ID=app_id
VITE_FIREBASE_MEASUREMENT_ID=measurement_id
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
```

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    match /rides/{rideId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    match /schedules/{scheduleId} {
      allow read, write: if request.auth != null;
    }
    
    match /fixedRides/{fixedRideId} {
      allow read, write: if request.auth != null;
    }
    
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                  resource.data.recipientId == request.auth.uid;
      allow write: if request.auth != null;
    }
    
    match /partners/{partnerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /programs/{programId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /rewards/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### Build Fails
- Check Node.js version (18+)
- Delete `node_modules` and run `npm install` again
- Check for missing environment variables

#### Firebase Connection Issues
- Verify Firebase config in `.env`
- Check Firebase project status
- Verify security rules allow access

#### Payment Not Working
- Verify Paystack public key
- Check internet connection
- Verify booking exists in Firestore

#### Notifications Not Appearing
- Check Firestore `notifications` collection
- Verify user is authenticated
- Check browser console for errors

#### Calendar Events Not Opening
- Verify Google Calendar URL format
- Check browser popup blocker
- Ensure date/time values are valid

---

## Support

For technical support or questions:
- **Phone**: +234 808 591 9225
- **Email**: support@myryde.app
- **GitHub Issues**: https://github.com/KEMS012/MyRyde/issues

---

## License

Copyright © 2026 MyRyde. All rights reserved.
