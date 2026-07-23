# Equipment Rental Manager — Technical Interview Preparation

---

## 1. Overall Architecture

The system follows a **classic 3-tier MERN architecture** with clear separation of concerns:

```
Browser (React SPA)
    ↕  HTTP/JSON over REST (Axios + httpOnly cookies)
Express.js API Server (Node.js)
    ↕  Mongoose ODM
MongoDB Atlas (Cloud Database)
    ↕
Cloudinary (Image CDN)
```

The frontend is a fully client-side SPA served by Vite. All data access goes through a versioned REST API (`/api/v1`). There is no server-side rendering. Auth state is maintained via **httpOnly cookies** (not localStorage) — the server is the single source of truth for session validity.

---

## 2. Frontend Architecture

| Layer | Technology | Role |
|---|---|---|
| Build | Vite + React | Fast HMR, tree-shaking, optimised production bundles |
| Routing | React Router v6 | Nested routes, layout-based access control |
| Styling | Tailwind CSS | Utility-first, consistent design tokens |
| Auth State | React Context + `useReducer`-style | Global user object, session restore on mount |
| HTTP | Axios instance (`api.js`) | Centralised baseURL, credentials, 401 interceptor |
| Forms | React Hook Form + Zod | Schema-driven validation, minimal re-renders |
| Notifications | react-hot-toast | Non-intrusive UX feedback |
| Charts | Recharts | Declarative SVG charts for dashboard |
| Icons | Lucide React | Consistent, tree-shakeable icon set |

**Key design decision:** The Axios interceptor in `api.js` handles **automatic token refresh** transparently. When a 401 is received on any request (except auth endpoints), it queues all in-flight requests, calls `/auth/refresh`, then replays them — the rest of the UI code is completely unaware this happened.

**Route protection** is handled by `ProtectedLayout`, which reads from `AuthContext` and redirects to `/login` if unauthenticated, or to the appropriate page if the role doesn't match. This keeps business logic out of individual page components.

---

## 3. Backend Architecture

The backend follows a **layered architecture** pattern:

```
Route → Middleware Chain → Controller → Service → Model → Database
```

| Layer | Responsibility |
|---|---|
| **Routes** | HTTP verb + path + middleware assembly only |
| **Middleware** | Auth (`protect`), authorization (`authorize`), validation, rate limiting, sanitization, upload |
| **Controllers** | Thin — extract request data, call service, shape HTTP response |
| **Services** | All business logic lives here. No HTTP concerns. |
| **Models** | Schema definition, indexing, hooks, instance methods |
| **Utils** | AppError, catchAsync, jwt, cookieOptions, availability, invoice |

**Key principle:** Controllers are intentionally thin. The goal is that services are independently testable without an HTTP layer. This is a deliberate separation that makes the codebase far more maintainable as it scales.

---

## 4. Folder Structure

```
mega/
├── backend/
│   └── src/
│       ├── config/         # db.js, cloudinary.js
│       ├── controllers/    # One file per domain (thin HTTP layer)
│       ├── middleware/     # protect, authorize, upload, rateLimiter, sanitize, errorHandler
│       ├── models/         # Mongoose schemas with indexes and hooks
│       ├── routes/         # Express routers, middleware assembly
│       ├── services/       # Business logic (the domain core)
│       ├── utils/          # AppError, catchAsync, jwt, invoice, availability, cookieOptions, validate
│       └── validators/     # express-validator rule arrays per domain
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI: ui/ (Button, Input, Badge, Modal), dashboard/
│       ├── context/        # AuthContext — global auth state
│       ├── layouts/        # PublicLayout, ProtectedLayout
│       ├── pages/          # admin/, customer/, public/, shared/
│       └── services/       # One file per domain — Axios calls only
└── .agents/
    └── AGENTS.md           # Project rules and context for AI collaboration
```

---

## 5. Database Design

### Models & Relationships

```
User (1) ──────────────────── (N) Rental  [customer FK]
Equipment (1) ──────────────── (N) Rental  [equipment FK]
Rental (1) ─────────────────── (1) Return  [unique constraint]
Rental (1) ─────────────────── (N) Payment [rental FK]
User (staff) (1) ──────────── (N) Return  [processedBy FK]
```

### Key Design Decisions

**Pricing snapshot on Rental creation:** `dailyRate`, `securityDeposit`, `totalDays`, `rentalCost`, `totalAmount` are all snapshotted at booking time. If admin changes the equipment rate later, existing rentals are not affected — critical for financial integrity.

**Soft status tracking with timestamps:** Each Rental stores `confirmedAt`, `checkedOutAt`, `returnedAt`, `cancelledAt` in addition to `status`. This enables full audit trails and business reporting without a separate event log.

**Unique constraint on Return.rental:** MongoDB-level uniqueness ensures only one return per rental is possible, even under concurrent requests.

**Indexes:**
- `Rental`: compound `(equipment, status, startDate, endDate)` for fast availability queries
- `Equipment`: text index `(name, description, serialNumber)` for full-text search; sparse unique on `serialNumber`
- `User`: text index `(name, email)` for customer search
- `Payment`: compound `(direction, status, paidAt)` for dashboard revenue aggregation; `(paymentType, paidAt)` for admin list

---

## 6. Authentication & Authorization Flow

### Token Strategy: Dual JWT (Access + Refresh)

```
Login Request
    → Server issues:
        accessToken  (15 min, httpOnly cookie)
        refreshToken (7 days, httpOnly cookie)
    
API Request
    → protect middleware reads accessToken from cookie
    → verifies JWT signature
    → fetches user from DB (checks still active)
    → attaches req.user

401 Received (expired access token)
    → Axios interceptor fires
    → All subsequent requests queued (isRefreshing flag)
    → POST /auth/refresh with refreshToken cookie
    → Server issues new accessToken cookie
    → Queue flushed, original request replayed
    → User never sees a login prompt
```

### Why httpOnly cookies over localStorage?
- **XSS resistance:** JavaScript cannot read httpOnly cookies, even if attacker injects a script
- **Automatic inclusion:** Browser sends cookies with every request to the origin
- **Logout is real:** Cookie can be cleared server-side; localStorage requires client cooperation

### Authorization: Role-Based
```
Roles: admin > staff > customer

protect   → confirms valid JWT + active user
authorize → confirms role is in allowed list

Examples:
POST /equipment  → authorize('admin', 'staff')
DELETE /equipment → authorize('admin')
GET /dashboard    → authorize('admin', 'staff')
POST /returns     → authorize('admin', 'staff')
```

---

## 7. API Design

### RESTful conventions followed:
- Resource-based URLs: `/api/v1/equipment`, `/api/v1/rentals`
- Correct HTTP verbs: GET (read), POST (create), PATCH (partial update), DELETE (delete)
- Consistent response envelope: `{ status: 'success'|'fail'|'error', data: {...} }`
- HTTP status codes: 200, 201, 204, 400, 401, 403, 404, 409, 500
- Versioning: `/api/v1/` prefix for forward compatibility
- Pagination: `{ total, page, limit, pages }` on all list endpoints
- Sub-resources: `PATCH /rentals/:id/status`, `GET /payments/rental/:rentalId`

### Consistent error shape:
```json
{ "status": "fail", "message": "Human-readable error message" }
```

---

## 8. State Management Strategy

**No Redux.** Deliberately chosen for this scale.

| State Type | Solution | Rationale |
|---|---|---|
| Auth (global, persistent) | React Context | One source of truth, simple, no boilerplate |
| Server data (per page) | Local `useState` + `useEffect` | Co-located with component that needs it |
| Forms | React Hook Form | Uncontrolled inputs — no re-render on every keystroke |
| Notifications | react-hot-toast | Event-driven, no state needed |

**Trade-off made:** At scale, per-page `useEffect` + `useState` leads to prop drilling and duplicate API calls. The correct next step would be **React Query / TanStack Query** — it adds automatic caching, background refetching, deduplication, and loading/error states. Not added here to keep scope appropriate for the portfolio phase.

---

## 9. Security Decisions

| Decision | Implementation | Why |
|---|---|---|
| httpOnly cookies | `authController.js` → `cookieOptions.js` | XSS cannot steal tokens |
| Rate limiting | `express-rate-limit`: 200/15min global, 20/15min on auth | Brute force + DDoS mitigation |
| Helmet | `app.use(helmet())` | Sets 11 security HTTP headers automatically |
| NoSQL injection sanitization | Custom `sanitize.js` middleware | Strips `$` prefix and `.` keys from body/query/params |
| Input validation | `express-validator` on all write endpoints | Rejects malformed data at the boundary |
| Password hashing | `bcrypt` with salt rounds = 12 | Industry standard; 12 rounds takes ~250ms — impractical to brute-force |
| Zod on frontend | Login, Register forms | Client-side UX validation — never trusted server-side |
| 10kb body limit | `express.json({ limit: '10kb' })` | Prevents memory exhaustion from large payloads |
| Image file filter | `multer` fileFilter by mimetype | Prevents non-image files being uploaded |
| Mongoose transactions | `rentalService`, `returnService` | Atomicity on multi-document writes — prevents data inconsistency on crash |

---

## 10. Performance Optimizations

| Area | Optimization |
|---|---|
| Dashboard aggregation | All 12 MongoDB queries run in `Promise.all` — parallel, not sequential |
| Text search | MongoDB text indexes on Equipment and User — no full collection scans |
| Payment compound indexes | `(direction, status, paidAt)` supports both filter + sort in a single index scan |
| Availability query | Compound index `(equipment, status, startDate, endDate)` on Rental |
| Lean queries | `.lean()` on all list/read queries — returns plain JS objects, not Mongoose documents (~2-3x faster) |
| Image transformation | Cloudinary upload applies `width: 1200, height: 900, quality: auto` at upload time — clients always receive optimised images |
| Pagination | All list endpoints are paginated — never return unbounded result sets |
| Frontend build | Vite tree-shaking + Rollup bundling; Tailwind CSS purging unused classes |
| Auto-refresh | Dashboard polls every 60s — not every render |

---

## 11. Scalability Considerations

**Horizontal scaling is possible with minimal changes:**
- The API is stateless — all state is in MongoDB and cookies
- Sessions are validated against DB on every request (no in-memory session store)
- Redis could be added as a token denylist for instant logout propagation at scale
- MongoDB Atlas scales horizontally via sharding; current indexes are designed for shard-key compatibility

**Current bottlenecks at scale:**
1. Dashboard aggregation — 12 parallel queries could be replaced with pre-computed materialized views or a caching layer (Redis TTL ~60s)
2. The `protect` middleware does a DB lookup on every request — could be mitigated with a short in-process LRU cache
3. Image uploads are synchronous in the request cycle — should be moved to a job queue (Bull/BullMQ) for production

---

## 12. Why Each Technology Was Chosen

| Technology | Reason |
|---|---|
| **MongoDB** | Schema flexibility for equipment metadata; Atlas managed service; built-in horizontal scaling; aggregation pipeline for analytics |
| **Mongoose** | Schema validation, lifecycle hooks (pre-save for password hashing, slug generation), population, lean queries |
| **Express.js** | Minimal, unopinionated, composable middleware — matches the layered architecture |
| **React** | Component model, ecosystem maturity, hooks API — ideal for complex interactive UI |
| **Vite** | Significantly faster than CRA; native ESM; excellent DX |
| **Tailwind CSS** | Utility-first eliminates context-switching; consistent design tokens; purged at build time |
| **React Hook Form + Zod** | RHF: uncontrolled = no re-renders; Zod: single schema source for both TS inference and runtime validation |
| **JWT (dual token)** | Stateless verification; short access token reduces attack window; refresh token for session continuity |
| **Multer + Cloudinary** | Multer for memory-buffered multipart parsing; Cloudinary for CDN delivery, on-the-fly transformations, and storage management |
| **bcrypt (12 rounds)** | Adaptive hashing — rounds can be increased as hardware improves; 12 is the industry standard for 2024+ |
| **express-validator** | Composable validation chains, integrates naturally into Express middleware pipeline |
| **Recharts** | React-native (not a wrapper), declarative API, good TypeScript support |

---

## 13. Design Trade-offs Made

| Trade-off | Decision Made | Why | What Was Given Up |
|---|---|---|---|
| REST vs GraphQL | REST | Simpler, widely understood, good tooling | No over/under-fetching elimination |
| JWT vs Sessions | JWT + httpOnly cookies | Stateless, horizontally scalable | Cannot instantly revoke — need token denylist for zero-latency logout |
| Context vs Redux | Context | Less boilerplate, sufficient for this scale | No DevTools, no time-travel debugging |
| Local state vs React Query | Local state | Simpler for portfolio scope | No caching, no background refetch, duplicate API calls |
| Sync image upload vs queue | Sync in request | Simpler implementation | Long response time on image-heavy equipment creation |
| Regex search vs Text index | Text index (upgraded in review) | Index-backed search | Text indexes have word-boundary limitations vs regex flexibility |
| Single server vs microservices | Monolith | Appropriate for this scale, easier to deploy and debug | No independent scaling of services |
| No email verification | Skipped | Scope; not a core requirement | Users can register with any email |

---

## 14. Possible Future Improvements

### Short-term (Production Readiness)
- [ ] Email verification on registration
- [ ] Password reset via email (nodemailer + token)
- [ ] Refresh token rotation + denylist in Redis
- [ ] Image upload via job queue (BullMQ)
- [ ] Unit tests (Jest) for all services; integration tests for API routes

### Medium-term (Feature Completeness)
- [ ] Replace local `useState` with React Query / TanStack Query
- [ ] Role management UI (promote customer to staff)
- [ ] PDF invoice download (Puppeteer or @react-pdf/renderer)
- [ ] Email notifications on rental status changes
- [ ] Customer-facing equipment catalog with public browsing (no auth)

### Long-term (Scale)
- [ ] Redis caching layer for dashboard aggregations (60s TTL)
- [ ] In-process LRU cache on `protect` middleware (reduce DB round-trips)
- [ ] WebSocket (Socket.io) for real-time dashboard updates
- [ ] Separate read replicas for analytics queries
- [ ] CI/CD pipeline (GitHub Actions → Railway/Render/AWS)
- [ ] Docker compose for local development parity

---

> **Mock Interview begins below. One question at a time.**

