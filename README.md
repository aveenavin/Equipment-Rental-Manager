# Equipment Rental Manager

A production-ready, full-stack equipment rental management platform built with the MERN stack. Designed to manage inventory, bookings, inspections, maintenance, and payments for equipment rental businesses.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas), Mongoose ODM |
| Authentication | JWT (Access + Refresh Tokens), bcryptjs |
| File Uploads | Multer, Cloudinary |
| Payments | Stripe (+ simulated mode) |

---

## Features

- **Role-Based Access Control** — Admin, Staff, and Customer roles with separate portals
- **Real-Time Availability Engine** — Prevents double-bookings via atomic database transactions
- **Equipment Inventory CRUD** — Multi-image upload via Cloudinary
- **Booking Lifecycle** — `Pending → Confirmed → Checked Out → Returned`
- **Return Inspection** — Damage recording, automatic late fee calculation, deposit refunds
- **Maintenance Logging** — Equipment status locked during active maintenance
- **Payment Integration** — Stripe-ready with simulated payment mode for demos
- **Admin BI Dashboard** — Revenue charts and equipment utilization analytics
- **Secure by Default** — httpOnly cookies, Helmet headers, rate limiting, NoSQL injection protection

---

## Project Structure

```
equipment-rental-manager/
├── backend/          # Node.js + Express API server
└── frontend/         # React + Vite client application
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB Atlas URI (or local MongoDB replica set)
- Cloudinary account
- Stripe account (optional — simulated mode available)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/equipment-rental-manager.git
cd equipment-rental-manager
```

**2. Set up the backend**
```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

**3. Set up the frontend**
```bash
cd frontend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required configuration values.

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

| Module | Endpoints |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/me` |
| Equipment | `/equipment` (CRUD + search) |
| Bookings | `/bookings` (create, list, cancel, checkout, return) |
| Maintenance | `/maintenance` (CRUD) |
| Payments | `/payments` |
| Analytics | `/analytics/summary`, `/analytics/utilization` |

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full system access — inventory CRUD, user management, analytics |
| **Staff** | Equipment checkout/return, inspection logging, maintenance management |
| **Customer** | Browse catalog, create bookings, manage own rentals |

---

## Security

- Passwords hashed with `bcryptjs` (cost factor 12)
- JWT tokens stored in `httpOnly`, `secure`, `sameSite` cookies
- Rate limiting: 200 req/15 min (global), 20 req/15 min (auth)
- NoSQL injection protection via custom sanitizer (Express 5 compatible)
- Secure HTTP headers via `helmet` with custom CSP
- Request body capped at 10 KB to prevent payload attacks
- `gzip` compression on all API responses

---

## Production Deployment

The backend is deployed to **Render** and the frontend to **Vercel**. Since they run on different domains, cookies are configured with `sameSite=none; secure` automatically.

### Backend → Render

**Option A — Blueprint (recommended)**
1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → connect your repo.
3. Render detects `render.yaml` and creates the service automatically.
4. Go to the created service → **Environment** → add all `sync: false` secrets.

**Option B — Manual**
1. Render Dashboard → **New → Web Service** → connect your repo.
2. Set **Root Directory**: `backend` | **Build**: `npm install` | **Start**: `npm start`
3. Add all environment variables from `backend/.env.production.example`.

### Frontend → Vercel

```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# From the frontend directory
cd frontend
vercel --prod
```

Or connect via Vercel Dashboard → **New Project** → import repo → set **Root Directory** to `frontend`.

**Required Vercel Environment Variable:**
```
VITE_API_BASE_URL = https://your-backend.onrender.com/api/v1
```

### Post-Deploy Verification

| Check | How |
|---|---|
| Backend alive | `GET https://your-backend.onrender.com/health` → `{"status":"ok"}` |
| API auth works | Login via frontend → check cookies in DevTools |
| DB connected | Server logs should show `MongoDB connected: ...` |
| Image uploads | Create equipment with images → verify Cloudinary URL |
| No source maps | DevTools Sources → no `.jsx` files visible |
| No stack traces | Hit a bad route → response should be `{"status":"error","message":"..."}` |

---

## License

MIT License — see `LICENSE` for details.

---

*Built as a portfolio project demonstrating production-ready MERN stack engineering practices.*
