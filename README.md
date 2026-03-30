# Smart Auto Share

A full-stack ride-sharing application specifically designed for auto-rickshaw rides. Users can share rides with others traveling similar routes to reduce travel costs.

## Features

### Core Features
- **User Authentication**: Secure signup/login with email and password using Supabase Auth
- **Ride Creation**: Create ride requests with pickup and destination locations
- **Smart Matching Algorithm**: AI-powered route matching to find the best co-passengers
- **Real-time Chat**: WhatsApp-style chat interface using Supabase Realtime
- **Fare Splitting**: Automatic fare calculation and splitting based on distance traveled
- **Booking System**: Simulated auto booking with driver details
- **Ride Status Tracking**: Track rides through multiple states (searching, matched, confirmed, in_progress, completed)
- **User Ratings**: Rate co-passengers after completing rides
- **Ride History**: View past rides and total savings
- **Responsive Design**: Mobile-friendly interface that works on all devices

### Technical Features
- **Distance Calculation**: Haversine formula for accurate distance calculation
- **Route Overlap Detection**: Smart algorithm to detect shared route segments
- **Match Scoring**: Weighted scoring system (30% pickup proximity, 30% destination proximity, 40% route overlap)
- **Real-time Updates**: Live updates for messages and ride status changes
- **Secure Database**: Row Level Security (RLS) policies on all tables

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Icons**: Lucide React
- **State Management**: React Context API

## Project Structure

```
src/
├── components/
│   ├── Auth/              # Authentication components
│   │   ├── AuthPage.tsx
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── Chat/              # Real-time messaging
│   │   ├── ChatInterface.tsx
│   │   └── MessagesPage.tsx
│   ├── Dashboard/         # Main dashboard views
│   │   ├── Dashboard.tsx
│   │   └── RideCard.tsx
│   ├── History/           # Ride history
│   │   └── HistoryPage.tsx
│   ├── Layout/            # Layout components
│   │   └── Navbar.tsx
│   ├── Map/               # Map visualization
│   │   └── SimpleMap.tsx
│   ├── Profile/           # User profile
│   │   └── ProfilePage.tsx
│   ├── Rating/            # Rating system
│   │   └── RatingModal.tsx
│   └── Rides/             # Ride management
│       ├── CreateRideForm.tsx
│       ├── MatchesView.tsx
│       └── RideDetailsView.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   └── supabase.ts        # Supabase client and types
├── utils/
│   └── matchingAlgorithm.ts  # Route matching logic
├── App.tsx                # Main app component
└── main.tsx              # Entry point
```

## Database Schema

### Tables

#### profiles
- User profile information extending auth.users
- Stores name, phone, avatar, rating, and total rides

#### rides
- Ride requests with pickup/destination coordinates and addresses
- Tracks status: searching → matched → confirmed → in_progress → completed
- Stores estimated distance, fare, and route information

#### ride_matches
- Matches between compatible rides
- Stores match score and shared distance
- Status: pending → accepted/rejected

#### bookings
- Confirmed bookings with participant list
- Fare split information
- Simulated auto and driver details

#### messages
- Real-time chat messages between users
- Linked to specific rides

#### ratings
- User ratings and comments
- Automatically updates user's average rating

## Matching Algorithm

The matching algorithm uses multiple factors to find compatible rides:

1. **Proximity Check**:
   - Pickup locations within 2km
   - Destination locations within 2km

2. **Route Overlap**:
   - Calculates shared route segments
   - Minimum 30% overlap required

3. **Match Score**:
   - 30% weight: Pickup proximity
   - 30% weight: Destination proximity
   - 40% weight: Route overlap percentage

4. **Savings Calculation**:
   - Base fare: ₹15 per km
   - Split equally among all passengers
   - Shows estimated savings for each match

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account (already configured in this project)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`

3. Database migrations have been applied automatically

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Usage Guide

### Creating an Account
1. Click "Sign Up" on the auth page
2. Enter your full name, email, and password
3. Optionally add your phone number
4. Your account is created instantly

### Creating a Ride
1. Click "Create Ride" on the dashboard
2. Enter pickup location (e.g., "Koramangala, Bangalore")
3. Enter destination (e.g., "MG Road, Bangalore")
4. Select maximum passengers (1-3)
5. Choose scheduled time
6. Click "Create Ride"

### Finding Matches
1. Your ride automatically searches for compatible rides
2. Click "View Matches" to see potential co-passengers
3. Review match scores and estimated savings
4. Chat with potential matches
5. Request to match with compatible riders

### Confirming a Booking
1. Once matched, click "Confirm Booking" (ride owner)
2. System generates auto details and driver information
3. Fare is automatically split among all passengers
4. Booking details shared with all participants

### Using Chat
1. Click "Messages" in the navigation
2. Select a conversation
3. Send real-time messages to co-passengers
4. Coordinate pickup details and timing

### Viewing History
1. Click "History" in navigation
2. View all completed and cancelled rides
3. See total distance traveled and money saved
4. Rate your co-passengers

## Security Features

- Row Level Security (RLS) on all database tables
- Users can only access their own data and public ride listings
- Authenticated access required for all operations
- Secure password hashing via Supabase Auth
- API keys stored in environment variables

## Future Enhancements

- Integration with real Google Maps API
- Real GPS tracking during rides
- Push notifications for matches and messages
- Payment gateway integration
- Advanced ride preferences (AC/non-AC, gender preference, etc.)
- Ride scheduling for recurring trips
- Group rides for 4+ passengers
- Driver verification system
- SOS/emergency features

## Known Limitations

- Location geocoding uses mock data (no real Google Maps API key)
- Auto booking is simulated (not connected to real auto service)
- No actual payment processing
- Map visualization is simplified (not real Google Maps)

## Support

For issues or questions, please refer to the Supabase documentation:
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- Realtime: https://supabase.com/docs/guides/realtime

## License

This project is for demonstration purposes.
# smartautoshare
