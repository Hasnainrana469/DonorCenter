# DonorCenter 🩸

> Emergency Blood Donor Management System — connecting donors with patients in real-time.

## Features

- 🔴 Emergency Blood Requests with urgency levels
- 🤖 AI-Based Donor Suggestions (compatibility + proximity scoring)
- 🗺️ Live Donor Map (OpenStreetMap / Leaflet)
- 💬 Real-Time Live Chat (WebSocket)
- 🔔 Real-Time Notifications (WebSocket)
- 📅 Appointment Booking
- 🏥 Blood Stock Management
- ✅ Eligibility Checker
- 📊 Admin Dashboard
- 🔐 OTP Security (Phone + Email)
- 🌍 Multi-language Support (EN, AR, FR, ES, UR, HI)
- 📱 SMS Alerts (Twilio)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Zustand |
| Backend | Django 6, Django REST Framework, Django Channels |
| Real-time | Daphne (ASGI), WebSockets |
| Auth | JWT (SimpleJWT) + OTP |
| Database | SQLite (dev) / PostgreSQL (prod) |

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# Or with WebSocket support:
python -m daphne -p 8000 backend.asgi:application
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Seed test data
```bash
cd backend
python seed_data.py
```

## Test Accounts

| Username | Password | Role |
|----------|----------|------|
| darkdominion.x | (your password) | Patient |
| donor_ahmed | Test1234! | Donor (A+) |
| donor_sara | Test1234! | Donor (B+) |
| donor_ali | Test1234! | Donor (O+) |
| donor_usman | Test1234! | Donor (O-) |

## Environment Variables

Copy `backend/.env.example` and fill in your values.

## License

MIT
