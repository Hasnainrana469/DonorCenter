# 🩸 Blood Donor Connect

> **Emergency Blood Donor Management System** — An AI-powered platform that connects blood donors with patients in real-time, reducing response time from hours to minutes.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Why We Built This](#why-we-built-this)
3. [When It Was Built](#when-it-was-built)
4. [Tech Stack](#tech-stack)
5. [Features & Functions](#features--functions)
6. [Form Validations](#form-validations)
7. [Authentication System](#authentication-system)
8. [Pages & Components](#pages--components)
9. [Database Structure](#database-structure)
10. [API Endpoints](#api-endpoints)
11. [Project Structure](#project-structure)
12. [Setup & Installation](#setup--installation)
13. [Test Accounts](#test-accounts)
14. [Environment Variables](#environment-variables)
15. [Changes & Improvements Log](#changes--improvements-log)

---

## 📌 Project Overview

**Blood Donor Connect** is a full-stack web application designed to solve the critical problem of blood shortage in emergency situations. The platform bridges the gap between blood donors and patients who urgently need blood transfusions.

The system uses AI-powered matching, real-time WebSocket communication, GPS-based location search, and automated notifications to ensure the fastest possible response in life-threatening situations.

**Live URLs (Development):**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- API Docs: `http://localhost:8000/api/docs`

---

## ❓ Why We Built This

Every year, thousands of patients die because compatible blood donors cannot be found in time. Traditional methods — phone calls, social media posts, hospital announcements — are slow and unreliable.

**Problems we solve:**
- ⏱️ Slow donor discovery — our AI matching finds compatible donors in seconds
- 📍 Location barriers — GPS-powered map shows nearest available donors
- 📢 Poor communication — real-time WebSocket notifications alert donors instantly
- 🏥 Blood bank gaps — live blood stock monitoring across all registered banks
- 🔒 Trust issues — OTP verification ensures donor authenticity

---

## 📅 When It Was Built

| Phase | Date | What Was Done |
|-------|------|---------------|
| Initial Build | April 2026 | Core backend (Django), frontend (Next.js), auth system |
| Feature Expansion | April–May 2026 | AI matching, live chat, maps, appointments, blood stock |
| Bug Fixes | May 2026 | Turbopack crash fix, hydration fix, login improvements |
| UI Overhaul | May 2026 | 21-point improvement: validations, OAuth, responsive design |
| Final Polish | May 2026 | README, feedback section, volunteer profiles, footer update |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.5.15 | React framework with App Router |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 4.x | Utility-first styling |
| Zustand | 5.x | Global state management (auth, notifications) |
| React Hook Form | 7.x | Form handling and validation |
| Zod | 4.x | Schema-based form validation |
| Axios | 1.x | HTTP client with JWT interceptors |
| Lucide React | 1.x | Icon library |
| Leaflet + React Leaflet | 1.9 / 5.x | Interactive maps |
| date-fns | 4.x | Date formatting and calculations |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Django | 6.0.4 | Python web framework |
| Django REST Framework | 3.x | RESTful API |
| Django Channels | 4.x | WebSocket support (chat, notifications) |
| SimpleJWT | 5.x | JWT authentication |
| drf-spectacular | 0.x | Auto API documentation (Swagger) |
| django-filters | 23.x | Advanced query filtering |
| Daphne | 4.x | ASGI server for WebSockets |
| google-auth | 2.x | Google OAuth token verification |

### Database
| Environment | Database |
|------------|---------|
| Development | SQLite (built-in, zero config) |
| Production | PostgreSQL (recommended) |

### Real-time
- **Django Channels** with **InMemoryChannelLayer** (dev) / Redis (prod)
- WebSocket connections for live chat and notifications

---

## ✨ Features & Functions

### 1. 🔴 Emergency Blood Requests
**What:** Patients or hospitals can post urgent blood requests with urgency levels (low / medium / high / critical).  
**Why:** Enables immediate broadcast to all compatible donors in the area.  
**Function:** Creates a `BloodRequest` record → triggers real-time notifications to nearby donors → donors can respond directly.

### 2. 🤖 AI-Based Donor Suggestions
**What:** Smart algorithm scores and ranks donors based on blood type compatibility, proximity, rating, and availability.  
**Why:** Manual searching is slow — AI finds the best match instantly.  
**Function:** `GET /api/donors/ai-suggestions/` → returns ranked donor list with compatibility scores.

### 3. 🗺️ Live Donor Map
**What:** Interactive map (OpenStreetMap via Leaflet) showing all available donors with their locations.  
**Why:** Visual discovery is faster than list browsing in emergencies.  
**Function:** Fetches donor coordinates → renders markers → click marker to view profile and contact.

### 4. 💬 Real-Time Live Chat
**What:** WebSocket-based messaging between donors and patients.  
**Why:** Direct communication speeds up coordination for pickup/delivery.  
**Function:** Django Channels consumer handles `ws://` connections → messages stored in DB → delivered instantly.

### 5. 🔔 Real-Time Notifications
**What:** Push notifications for new blood requests, donor responses, and status updates.  
**Why:** Ensures no urgent request goes unnoticed.  
**Function:** WebSocket broadcast on new events → unread count badge in navbar → notification center page.

### 6. 📅 Appointment Booking
**What:** Donors can schedule donation appointments at registered hospitals.  
**Why:** Reduces walk-in confusion and ensures hospital readiness.  
**Function:** `POST /api/appointments/` → creates appointment → sends confirmation notification.

### 7. 🏥 Blood Stock Management
**What:** Real-time dashboard showing blood availability across all registered blood banks.  
**Why:** Helps patients find the nearest bank with their required blood type.  
**Function:** Blood banks update stock levels → frontend displays status (critical/low/moderate/adequate).

### 8. ✅ Eligibility Checker
**What:** Smart form that checks if a user is eligible to donate blood based on health criteria.  
**Why:** Prevents ineligible donors from wasting time and ensures safe donations.  
**Function:** Checks age, weight, last donation date, medical conditions → returns eligibility result.

### 9. 📊 Admin Dashboard
**What:** Full admin panel for platform management — user stats, request monitoring, donor management.  
**Why:** Platform administrators need oversight and control.  
**Function:** `GET /api/auth/admin/stats/` → aggregated platform statistics → admin-only access.

### 10. 🔐 OTP Verification
**What:** One-time password verification for phone and email.  
**Why:** Ensures donor authenticity and prevents fake accounts.  
**Function:** `POST /api/auth/send-otp/` → sends 6-digit code → `POST /api/auth/verify-otp/` → marks account verified.

### 11. 🌍 Multi-language Support
**What:** Platform available in 6 languages: English, Arabic, French, Spanish, Urdu, Hindi.  
**Why:** Serves diverse communities across different regions.  
**Function:** Language preference stored in user profile → applied to UI rendering.

### 12. 📱 SMS Alerts (Twilio)
**What:** Automated SMS notifications for critical blood requests.  
**Why:** Reaches donors even when they're not on the platform.  
**Function:** Twilio API integration → triggered on critical urgency requests.

### 13. 🔍 Donor Search & Filtering
**What:** Advanced search by blood type, city, availability, rating, and distance.  
**Why:** Helps patients find the most suitable donor quickly.  
**Function:** `GET /api/donors/profiles/?blood_type=A+&city=Lahore&is_available=true`

### 14. 📜 Donation History
**What:** Complete history of all donations made by a donor.  
**Why:** Tracks donor contribution and enforces safe donation intervals.  
**Function:** Records each completed donation → displays timeline with dates and hospitals.

### 15. 🌐 Google OAuth
**What:** Sign in / Sign up using Google account.  
**Why:** Reduces registration friction — one click instead of filling a form.  
**Function:** Google GSI script → ID token → `POST /api/auth/google/` → backend verifies token → returns JWT.

### 16. 💬 Feedback System
**What:** Users can submit star ratings and written reviews on the home page.  
**Why:** Builds trust and helps improve the platform.  
**Function:** Star rating selector (1–5) + text area → stored and displayed in real-time.

---

## ✅ Form Validations

All validations implemented using **Zod** schema + **React Hook Form**.

| Field | Rule | Error Message |
|-------|------|---------------|
| Username | Min 3 chars, no numbers | "Username cannot contain numbers" |
| Email | Must end with `@gmail.com` | "Please use a valid Gmail address (@gmail.com)" |
| Phone | Exactly 11 digits, starts with `03` | "Enter a valid Pakistani number starting with 03" |
| Password | Min 8 characters | "Min 8 characters" |
| Confirm Password | Must match password | "Passwords do not match" |
| City | Optional, no numbers if filled | "City cannot contain numbers" |
| Country | Required, no numbers | "Country cannot contain numbers" |
| Age (Donor) | 18–120 | "Age cannot exceed 120 years" |
| Weight (Donor) | Positive number only, no letters/minus | "Weight must be positive" |
| Hospital | Pakistani hospitals only | Dropdown with 33 real hospitals |

---

## 🔐 Authentication System

### Regular Login
- Username or email + password
- Returns JWT access token (24h) + refresh token (7 days)
- Auto-refresh on 401 via Axios interceptor

### Google OAuth
- Uses Google Identity Services (GSI) script
- Frontend sends Google ID token to `POST /api/auth/google/`
- Backend verifies with `google-auth` library
- Creates new user if first time, or logs in existing user
- Returns same JWT structure as regular login

### Admin Login
- Dedicated "Login as Admin" button on login page
- Pre-fills Admin credentials
- Redirects to admin dashboard after login

### Password Security
- Show/hide toggle on all password fields (eye icon)
- Real-time match indicator — green ✓ when passwords match, red ✗ when they don't
- Minimum 8 characters enforced

---

## 📄 Pages & Components

### Public Pages
| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page with hero, features, volunteers, feedback |
| Login | `/login` | Email/password + Google OAuth + Admin login |
| Register | `/register` | Full registration with Pakistani validations |

### Dashboard Pages (Protected)
| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/dashboard` | Overview with stats, recent requests, available donors |
| Find Donors | `/dashboard/donors` | Search and filter donors by blood type, city, availability |
| Blood Requests | `/dashboard/requests` | Browse and respond to blood requests |
| AI Suggestions | `/dashboard/ai-suggestions` | AI-ranked donor recommendations |
| Live Map | `/dashboard/map` | Interactive donor location map |
| Blood Stock | `/dashboard/blood-stock` | Blood bank inventory levels |
| Appointments | `/dashboard/appointments` | Book and manage donation appointments |
| Live Chat | `/dashboard/chat` | Real-time messaging with donors/patients |
| Notifications | `/dashboard/notifications` | All platform notifications |
| Eligibility Check | `/dashboard/eligibility` | Check donation eligibility |
| Donation History | `/dashboard/history` | Past donation records |
| My Profile | `/dashboard/profile` | Edit profile, view verification status |
| Admin Panel | `/dashboard/admin` | Platform statistics and management |

### Components
| Component | File | Function |
|-----------|------|---------|
| NavBar | `components/NavBar.tsx` | Responsive navbar — full on desktop, hamburger on mobile |
| Sidebar | `components/Sidebar.tsx` | Dashboard navigation sidebar |
| FeedbackSection | `components/FeedbackSection.tsx` | Star rating + review submission and display |
| GoogleLoginButton | `components/GoogleLoginButton.tsx` | Google OAuth button with GSI integration |
| NewsletterForm | `components/NewsletterForm.tsx` | Email subscription form |
| SocialIcons | `components/SocialIcons.tsx` | Social media icon links |
| DonorMap | `components/DonorMap.tsx` | Leaflet map with donor markers |

---

## 🗄️ Database Structure

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| username | String | Unique username |
| email | String | Unique email |
| phone | String | Pakistani format (03xxxxxxxxx) |
| password | String | Hashed (bcrypt) |
| role | Enum | donor / patient / admin |
| city | String | User's city |
| country | String | User's country |
| language | String | Preferred language |
| is_phone_verified | Boolean | OTP phone verification status |
| is_email_verified | Boolean | OTP email verification status |
| profile_picture | String | Profile image URL |

### DonorProfile Table
| Field | Type | Description |
|-------|------|-------------|
| user | FK → User | One-to-one with User |
| blood_type | Enum | A+/A-/B+/B-/AB+/AB-/O+/O- |
| weight | Float | Weight in kg (min 30) |
| age | Integer | Age (18–120) |
| is_available | Boolean | Currently available to donate |
| last_donation_date | Date | Last donation date |
| total_donations | Integer | Lifetime donation count |
| average_rating | Float | Donor rating (1–5) |
| bio | Text | Donor description |

### BloodRequest Table
| Field | Type | Description |
|-------|------|-------------|
| requester | FK → User | Who posted the request |
| blood_type | Enum | Required blood type |
| units_needed | Float | Units required |
| urgency | Enum | low/medium/high/critical |
| status | Enum | open/in_progress/fulfilled/cancelled |
| hospital_name | String | Pakistani hospital name |
| city | String | Location |
| patient_name | String | Patient's name |
| contact_phone | String | Contact number |

### Notifications Table
| Field | Type | Description |
|-------|------|-------------|
| recipient | FK → User | Who receives the notification |
| notification_type | String | Type of notification |
| title | String | Notification title |
| message | Text | Full message |
| is_read | Boolean | Read status |
| data | JSON | Extra metadata |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login with username/email + password |
| POST | `/api/auth/google/` | Login/register with Google OAuth |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |
| GET | `/api/auth/profile/` | Get current user profile |
| PATCH | `/api/auth/profile/` | Update profile |
| POST | `/api/auth/send-otp/` | Send OTP to phone/email |
| POST | `/api/auth/verify-otp/` | Verify OTP code |

### Donors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donors/profiles/` | List all donors (filterable) |
| POST | `/api/donors/profiles/` | Register as donor |
| GET | `/api/donors/ai-suggestions/` | AI-ranked donor suggestions |

### Blood Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests/` | List all requests |
| POST | `/api/requests/` | Create new request |
| PATCH | `/api/requests/{id}/respond/` | Respond to a request |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | Get all notifications |
| GET | `/api/notifications/unread-count/` | Get unread count |
| PATCH | `/api/notifications/{id}/mark-read/` | Mark as read |

### Blood Stock
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blood-stock/banks/` | List all blood banks with stock |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/` | List user's appointments |
| POST | `/api/appointments/` | Book new appointment |

---

## 📁 Project Structure

```
Blood Donor Connect/
├── backend/                          # Django backend
│   ├── accounts/                     # Auth, users, OTP, Google OAuth
│   │   ├── models.py                 # User, OTPVerification, Newsletter models
│   │   ├── views.py                  # Register, Login, Google OAuth, Profile views
│   │   ├── serializers.py            # Data serialization
│   │   └── urls.py                   # Auth URL routes
│   ├── donors/                       # Donor profiles & AI matching
│   ├── requests_app/                 # Blood request management
│   ├── notifications/                # WebSocket notifications
│   ├── appointments/                 # Appointment booking
│   ├── blood_stock/                  # Blood bank inventory
│   ├── chat/                         # Real-time WebSocket chat
│   ├── backend/                      # Django settings & config
│   │   ├── settings.py               # All configuration
│   │   ├── urls.py                   # Root URL configuration
│   │   └── asgi.py                   # ASGI config for WebSockets
│   ├── manage.py                     # Django management
│   └── .env                          # Environment variables
│
└── frontend/                         # Next.js frontend
    ├── app/
    │   ├── page.tsx                  # Home page
    │   ├── layout.tsx                # Root layout
    │   ├── globals.css               # Global styles + animations
    │   ├── (auth)/
    │   │   ├── layout.tsx            # Auth split-panel layout
    │   │   ├── login/page.tsx        # Login page
    │   │   └── register/page.tsx     # Registration page
    │   └── (dashboard)/
    │       ├── layout.tsx            # Dashboard layout with sidebar
    │       └── dashboard/
    │           ├── page.tsx          # Dashboard home
    │           ├── donors/           # Find donors
    │           ├── requests/         # Blood requests
    │           ├── ai-suggestions/   # AI matching
    │           ├── map/              # Live map
    │           ├── blood-stock/      # Blood bank stock
    │           ├── appointments/     # Appointments
    │           ├── chat/             # Live chat
    │           ├── notifications/    # Notifications
    │           ├── eligibility/      # Eligibility checker
    │           ├── history/          # Donation history
    │           ├── profile/          # User profile
    │           └── admin/            # Admin panel
    ├── components/
    │   ├── NavBar.tsx                # Responsive navigation bar
    │   ├── Sidebar.tsx               # Dashboard sidebar
    │   ├── FeedbackSection.tsx       # Star rating + reviews
    │   ├── GoogleLoginButton.tsx     # Google OAuth button
    │   ├── NewsletterForm.tsx        # Email subscription
    │   ├── SocialIcons.tsx           # Social media links
    │   └── DonorMap.tsx              # Leaflet map component
    ├── lib/
    │   ├── api.ts                    # Axios instance + JWT interceptors
    │   ├── store.ts                  # Zustand auth + notification stores
    │   ├── types.ts                  # TypeScript interfaces
    │   └── constants.ts              # Blood types, colors, languages
    └── .env.local                    # Frontend environment variables
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- pip

### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create test data
python create_test_users.py

# Start server
python manage.py runserver
# Server runs at http://127.0.0.1:8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs at http://localhost:3000
```

---

## 👤 Test Accounts

| Username | Password | Role | Blood Type |
|----------|----------|------|-----------|
| `darkdominion.x` | `Test1234!` | Patient | — |
| `donor_ahmed` | `Test1234!` | Donor | A+ |
| `donor_sara` | `Test1234!` | Donor | B+ |
| `donor_ali` | `Test1234!` | Donor | O+ |
| `donor_usman` | `Test1234!` | Donor | O- |
| `donor_fatima` | `Test1234!` | Donor | AB+ |
| `Admin` | `Test1234!` | Admin | — |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Google OAuth (free — get from console.cloud.google.com)
GOOGLE_CLIENT_ID=484822651018-u46mdmrepn3r6hudd8lk5g09mr3jdog5.apps.googleusercontent.com

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# SMS — Twilio (optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=484822651018-u46mdmrepn3r6hudd8lk5g09mr3jdog5.apps.googleusercontent.com
```

---

## 📝 Changes & Improvements Log

### Round 1 — Core Build (April 2026)
- Built Django backend with 8 apps: accounts, donors, requests, notifications, appointments, blood_stock, chat
- Built Next.js frontend with App Router, TypeScript, Tailwind CSS
- Implemented JWT authentication with auto-refresh
- Added WebSocket support via Django Channels for live chat and notifications
- Integrated Leaflet maps for donor location display
- Built AI donor matching algorithm

### Round 2 — Bug Fixes (May 2026)
- Fixed Turbopack crash ("Next.js package not found") — downgraded to Next.js 15.5.15
- Fixed dashboard hydration redirect loop — added `hydrated` flag before auth check
- Fixed missing `from django.conf import settings` import in accounts/views.py
- Fixed login to support both username and email
- Reset all test user passwords to `Test1234!`

### Round 3 — 21-Point Improvement (May 2026)

**Form Validations:**
- No numbers allowed in Name, City, Country fields
- Phone validation: exactly 11 digits, must start with `03` (Pakistani format)
- Email validation: only `@gmail.com` addresses accepted
- Age field: maximum value capped at 120
- Weight field: blocks letters and minus symbol
- City field made optional (no longer blocks form submission)
- Pakistani hospital names added to donor registration dropdown (33 hospitals)

**Authentication:**
- Added "Login as Admin" button on login page (visually distinct, dark styled)
- Added show/hide password toggle (eye icon) on all password fields
- Added real-time password match indicator (green ✓ / red ✗)
- Implemented Google OAuth 2.0 — full backend verification + frontend GSI button
- Google Client ID configured: `484822651018-u46mdmrepn3r6hudd8lk5g09mr3jdog5`

**Navigation:**
- Fixed all broken navbar links
- Fixed navbar collapse on desktop — hamburger only appears on screens < 992px
- Built new responsive `NavBar` component

**Home Page:**
- Added hero zoom-in animation on page load (`scale 0.97 → 1` over 0.6s)
- Fixed full responsiveness across 320px, 768px, 1280px+ breakpoints
- Removed `+1 (454) 556-5656` phone number from top bar
- Added Feedback Section with star rating (1–5) and written reviews

**UI Improvements:**
- Applied `text-shadow` on all major headings
- Applied `box-shadow` on all cards with hover lift effect
- Applied `transition` animations on all buttons, links, and cards

**Volunteers Page:**
- Removed generic emoji icons, replaced with profile photos (avatar images)
- Added "Experience" field to each volunteer card
- Made volunteer cards larger to accommodate new content

**User Profile:**
- Removed Verify button, verification prompt, and OTP modal
- Kept verification status badges (✓ Verified) as read-only display

**Footer:**
- Removed email input field from newsletter section
- Updated phone: `0300 0000000`
- Updated email: `kainatkhan1379@gmail.com`
- Updated address: `Gulistan Colony, Faisalabad, Pakistan`
- Replaced newsletter with Quick Links section

**Dropdowns:**
- Replaced City and Country text inputs with searchable animated slide-down dropdowns
- Real-time filtering (case-insensitive, contains-match)
- Country dropdown: all world countries
- City dropdown: Pakistani cities

---

## 📜 License

MIT License — Free to use, modify, and distribute.

---

## 👨‍💻 Built By

**Blood Donor Connect Team**  
Contact: kainatkhan1379@gmail.com  
Address: Gulistan Colony, Faisalabad, Pakistan  
Phone: 0300 0000000

> *"Every drop counts. Save a life."* 🩸
