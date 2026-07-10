# Implementation Roadmap
## Equipment Rental Manager — MERN Stack

> **Status**: Architecture Approved ✅ | Awaiting Phase 1 Execution Approval
> **Stack**: React (Vite) · Tailwind CSS · React Router · Axios · Node.js · Express.js · MongoDB · Mongoose · JWT · bcrypt · Multer · Cloudinary

---

## Execution Strategy

The project is divided into **8 phases** following strict dependency order. No phase begins before its prerequisites are stable, tested, and verified. Each phase ends with a defined deliverable and test checkpoint.

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
  Git       Backend    Auth      Equip    Booking   Return/    Payment   Frontend
  Setup     Scaffold   System    CRUD     Engine    Maint.    & Reports  & Deploy
```

**Independent Modules** (can be built in parallel once prerequisites exist):
- Maintenance Log system (Phase 5) is independent of the Payment system (Phase 6)
- Frontend auth pages (Phase 7) are independent of Admin dashboard pages (Phase 7)

---

## 🏁 Phase 0 — Project Initialization & Git Foundation

> **Critical Milestone** | Risk: 🟢 Low | Complexity: ⭐ 1/5

### Objective
Establish the professional project scaffold, version control baseline, and folder architecture that every subsequent phase depends on. A flawed foundation here compounds into every future phase.

### Features / Modules
- Git repository initialization with Conventional Commits enforced
- Monorepo folder skeleton (`backend/` and `frontend/`)
- Environment variable templates
- Editor configuration (consistent formatting, line endings)

### Files to be Created
| File | Purpose |
|---|---|
| `.gitignore` | Exclude `node_modules`, `.env`, build artifacts, OS files |
| `.gitattributes` | Enforce LF line endings across OS environments |
| `.editorconfig` | Consistent indent style, charset, trailing newlines |
| `README.md` | Project overview, setup instructions, tech stack |
| `backend/.env.example` | Template for all required environment variables |
| `frontend/.env.example` | Template for Vite public environment variables |

### Dependencies
- None (pure scaffolding)

### Deliverables
- Clean Git repo with initial commit
- Documented environment variable template
- Consistent code style config applied

### Testing Strategy
- Manual: Verify `.gitignore` excludes correct paths by running `git status` after adding dummy files
- Manual: Confirm folder structure matches the SDD specification

### Potential Risks
- None significant at this stage

---

## 🔧 Phase 1 — Backend Foundation & Express Application

> **Critical Milestone** | Risk: 🟡 Medium | Complexity: ⭐⭐ 2/5

### Objective
Build the complete Express application skeleton including middleware stack, database connection, global error handling, and API versioning. This is the backbone every backend feature attaches to.

### Features / Modules
- Express app with full middleware pipeline
- MongoDB connection with Mongoose (reconnection logic)
- Global `AppError` class and centralized error handler
- `catchAsync` utility to eliminate try/catch boilerplate
- API versioning under `/api/v1`
- Security middleware (Helmet, CORS, Rate Limiter, Mongo Sanitize)
- HTTP request logging (Morgan)
- Health check endpoint

### Files to be Created
| File | Purpose |
|---|---|
| `backend/package.json` | Backend dependencies and scripts |
| `backend/server.js` | Entry point — binds Express app to port, handles unhandled rejections |
| `backend/src/app.js` | Express app factory — registers all middleware and routers |
| `backend/src/config/db.js` | Mongoose connection with retry/reconnect logic |
| `backend/src/config/cloudinary.js` | Cloudinary SDK initialization |
| `backend/src/utils/AppError.js` | Custom operational error class |
| `backend/src/utils/catchAsync.js` | Async error wrapper for controllers |
| `backend/src/middleware/errorHandler.js` | Global Express error middleware (dev vs prod modes) |
| `backend/src/middleware/rateLimiter.js` | Rate limit configurations (global + strict auth routes) |
| `backend/src/routes/index.js` | Root API router — mounts all sub-routers |

### Dependencies to Install
| Package | Reason |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `dotenv` | Environment variable loading |
| `cors` | Cross-Origin Resource Sharing control |
| `helmet` | Secure HTTP response headers |
| `morgan` | HTTP request logger |
| `cookie-parser` | Parse cookies from incoming requests |
| `express-rate-limit` | Brute-force protection |
| `express-mongo-sanitize` | NoSQL injection prevention |
| `cloudinary` | Cloudinary SDK for image management |
| `nodemon` (dev) | Auto-restart during development |

### Deliverables
- Express server boots cleanly and connects to MongoDB
- All security middleware active
- Health check at `GET /api/v1/health` returns `{ status: 'ok' }`
- Global error handler returns correct JSON in both dev and prod modes

### Testing Strategy
- Manual: Boot server, confirm MongoDB connection log
- Manual: Hit health check endpoint with `curl` or Postman
- Manual: Trigger a 404 route and confirm structured error JSON returned
- Manual: Trigger a route with malicious `$where` payload and confirm sanitization blocks it

### Potential Risks
- MongoDB Atlas network connectivity or IP whitelist issues during development
- CORS misconfiguration blocking frontend later → define allowed origins from the start

---

## 🔐 Phase 2 — Authentication System (Users, JWT, Cookies)

> **Critical Milestone** | Risk: 🔴 High | Complexity: ⭐⭐⭐ 3/5

### Objective
Implement the complete, production-ready authentication system. This is the highest-risk phase because every protected feature in the application depends on it being correct. JWT secret rotation, cookie security attributes, refresh token logic, and RBAC middleware all live here.

### Features / Modules
- User Mongoose schema with bcrypt pre-save hook
- JWT access token (15-min TTL) + refresh token (7-day TTL)
- Secure `httpOnly` cookie issuance and clearing
- Auth endpoints: Register, Login, Logout, Refresh, Me
- `protect` middleware — validates access token on every protected route
- `authorize` middleware — enforces RBAC per role
- Input validation schemas for all auth routes

### Files to be Created
| File | Purpose |
|---|---|
| `backend/src/models/User.js` | Mongoose schema: fields, password hashing pre-save hook, comparePassword method |
| `backend/src/utils/jwt.js` | `signAccessToken`, `signRefreshToken`, `verifyToken` utilities |
| `backend/src/utils/cookieOptions.js` | Centralized cookie attribute config (httpOnly, secure, sameSite) |
| `backend/src/middleware/protect.js` | JWT validation middleware — attaches `req.user` |
| `backend/src/middleware/authorize.js` | RBAC role-check middleware factory |
| `backend/src/controllers/authController.js` | Handler logic for all auth endpoints |
| `backend/src/services/authService.js` | Business logic: validate credentials, generate tokens, manage refresh state |
| `backend/src/validators/authValidator.js` | express-validator schemas for register/login inputs |
| `backend/src/routes/authRoutes.js` | Auth endpoint route definitions |

### Files to be Modified
| File | Change |
|---|---|
| `backend/src/routes/index.js` | Mount authRoutes under `/auth` |

### Dependencies to Install
| Package | Reason |
|---|---|
| `jsonwebtoken` | JWT signing and verification |
| `bcryptjs` | Password hashing (pure JS, no native build dependencies) |
| `express-validator` | Server-side request body validation |

### Deliverables
- `POST /api/v1/auth/register` creates a new customer user
- `POST /api/v1/auth/login` validates credentials and sets secure cookies
- `POST /api/v1/auth/logout` clears all auth cookies
- `POST /api/v1/auth/refresh` rotates and reissues access token
- `GET /api/v1/auth/me` returns authenticated user profile
- Protected routes return `401` without a valid token
- Routes restricted by role return `403` for insufficient roles

### Testing Strategy
- Manual (Postman): Register a new user, confirm password is hashed in DB
- Manual (Postman): Login and inspect cookie attributes in browser DevTools
- Manual (Postman): Hit `/me` without a cookie — confirm 401 response
- Manual (Postman): Use a customer token on an admin route — confirm 403 response
- Manual (Postman): Let access token expire, use refresh token to get a new one

### Potential Risks
- **Highest risk phase** — security bugs here compromise the entire application
- Refresh token invalidation on logout must be robust (token blacklist or DB validation)
- `sameSite=strict` may conflict with cross-domain deployment — requires verification in staging

---

## 📦 Phase 3 — Equipment Inventory System

> Risk: 🟡 Medium | Complexity: ⭐⭐⭐ 3/5

### Objective
Build the complete equipment inventory management system with image upload via Multer + Cloudinary, admin CRUD operations, and the public-facing catalog search API with pagination and filtering.

### Features / Modules
- Equipment Mongoose schema with all fields and status lifecycle
- Multi-image upload middleware (Multer → Cloudinary)
- Public catalog API: search, filter by category/status/availability dates, pagination
- Admin: Create, Update, Retire equipment
- Text indexes on name + model for efficient keyword search

### Files to be Created
| File | Purpose |
|---|---|
| `backend/src/models/Equipment.js` | Mongoose schema: all equipment fields, indexes, status enum |
| `backend/src/middleware/uploadMiddleware.js` | Multer config (memory storage) + Cloudinary stream upload helper |
| `backend/src/controllers/equipmentController.js` | Handlers for all equipment endpoints |
| `backend/src/services/equipmentService.js` | Business logic: availability date-range check, Cloudinary upload calls |
| `backend/src/validators/equipmentValidator.js` | express-validator schemas for equipment create/update |
| `backend/src/routes/equipmentRoutes.js` | Equipment endpoint definitions with auth middleware applied |

### Files to be Modified
| File | Change |
|---|---|
| `backend/src/routes/index.js` | Mount equipmentRoutes under `/equipment` |
| `backend/src/config/cloudinary.js` | Finalize Cloudinary upload preset config |

### Dependencies to Install
| Package | Reason |
|---|---|
| `multer` | Parse multipart/form-data for image file uploads |
| `streamifier` | Convert buffer to stream for Cloudinary SDK upload |

### Deliverables
- `GET /api/v1/equipment` returns paginated, searchable, filterable catalog
- `GET /api/v1/equipment/:id` returns full equipment spec
- `POST /api/v1/equipment` (Admin) creates new equipment with images uploaded to Cloudinary
- `PUT /api/v1/equipment/:id` (Admin/Staff) updates equipment fields
- `DELETE /api/v1/equipment/:id` (Admin) soft-deletes by setting status to `retired`
- Searching by name, model, or description works via MongoDB text index

### Testing Strategy
- Manual (Postman): Create equipment with 3 images — confirm Cloudinary URLs stored in DB
- Manual (Postman): Search by keyword and confirm text index results are accurate
- Manual (Postman): Attempt to create equipment as a Customer — confirm 403 returned
- Manual (Postman): Filter by category and confirm only matching items returned

### Potential Risks
- Multer memory buffer size limits for large images — configure `limits.fileSize`
- Cloudinary API key misconfiguration during testing
- Text search index requires explicit creation on the collection

---

## 📅 Phase 4 — Booking Engine (Core Business Logic)

> **Critical Milestone** | Risk: 🔴 High | Complexity: ⭐⭐⭐⭐ 4/5

### Objective
Implement the core rental booking engine. This is the most complex backend phase because it involves atomic availability checking, concurrent request handling via MongoDB transactions, pricing computation, and multi-status lifecycle management.

### Features / Modules
- Booking Mongoose schema with full status and payment state tracking
- Date-overlap collision detection query
- Atomic booking creation inside a MongoDB transaction session
- Pricing engine: compute rental days × daily rate + security deposit
- Booking status lifecycle: `pending` → `confirmed` → `checked_out` → `returned`
- Booking cancel with grace-window enforcement
- Role-based booking retrieval (Admin/Staff see all; Customer sees own)

### Files to be Created
| File | Purpose |
|---|---|
| `backend/src/models/Booking.js` | Mongoose schema: all booking fields, compound index on equipment + dates |
| `backend/src/controllers/bookingController.js` | Handlers for all booking endpoints |
| `backend/src/services/bookingService.js` | Core engine: overlap check query, transaction session, pricing calculator |
| `backend/src/validators/bookingValidator.js` | Validation: valid dates, start < end, equipment ID format |
| `backend/src/routes/bookingRoutes.js` | Booking endpoint definitions |

### Files to be Modified
| File | Change |
|---|---|
| `backend/src/routes/index.js` | Mount bookingRoutes under `/bookings` |

### Dependencies to Install
- None (MongoDB transactions are built-in; no additional packages needed)

### Deliverables
- `POST /api/v1/bookings` creates a booking only if dates are available — atomic check
- Simultaneous conflicting requests are safely rejected — concurrency safe
- Pricing is computed server-side (never trusted from client)
- `GET /api/v1/bookings` returns correct results filtered by role
- `PATCH /api/v1/bookings/:id/cancel` enforces cancellation rules
- Double-booking is mathematically impossible under concurrent load

### Testing Strategy
- Manual (Postman): Book item for Jan 5–10, then attempt to book same item for Jan 8–12 — confirm 409 Conflict
- Manual (Postman): Book same item for Jan 11–15 — confirm success (no overlap)
- Manual (Postman): Cancel a booking as the owning customer — confirm success
- Manual (Postman): Cancel another user's booking as Customer — confirm 403
- Stress test: Fire two simultaneous booking requests for the same item — confirm only one succeeds

### Potential Risks
- **Highest complexity phase** — date overlap query must be mathematically airtight:
  ```
  Overlap exists if: existingStart < newEnd AND existingEnd > newStart
  ```
- MongoDB transactions require a replica set — local dev needs MongoDB configured as a replica set or use MongoDB Atlas
- Race conditions under concurrent load if transactions are not used correctly

---

## 🔄 Phase 5 — Return Inspection, Late Fees & Maintenance System

> Risk: 🟡 Medium | Complexity: ⭐⭐⭐ 3/5

### Objective
Build the staff-facing operational workflows: equipment checkout confirmation, return inspection with damage recording, automatic late fee calculation, and the maintenance logging system. These are independent of the payment integration.

### Features / Modules
- Checkout action: Staff confirms physical handover, status → `checked_out`
- Return action: Staff records condition, late fees auto-calculated if overdue
- Damage charge recording against security deposit
- Equipment status reverts to `available` after successful return
- Maintenance Log Mongoose schema
- Create / Update / Complete maintenance entries
- Equipment locked to `maintenance` status while a log is open

### Files to be Created
| File | Purpose |
|---|---|
| `backend/src/models/MaintenanceLog.js` | Mongoose schema: equipment ref, cost, dates, technician notes |
| `backend/src/services/rentalOperationsService.js` | Late fee calculator, inspection logic, status transition validators |
| `backend/src/controllers/maintenanceController.js` | Handlers for maintenance endpoints |
| `backend/src/validators/maintenanceValidator.js` | Validation for maintenance log inputs |
| `backend/src/routes/maintenanceRoutes.js` | Maintenance endpoint definitions |

### Files to be Modified
| File | Change |
|---|---|
| `backend/src/controllers/bookingController.js` | Add checkout handler and return handler using rentalOperationsService |
| `backend/src/routes/bookingRoutes.js` | Add `POST /:id/checkout` and `POST /:id/return` routes |
| `backend/src/routes/index.js` | Mount maintenanceRoutes under `/maintenance` |

### Deliverables
- `POST /api/v1/bookings/:id/checkout` transitions booking to `checked_out` and equipment to `rented`
- `POST /api/v1/bookings/:id/return` calculates late fees, records inspection, and frees equipment
- `POST /api/v1/maintenance` creates a log and locks equipment to `maintenance`
- `PUT /api/v1/maintenance/:id` completes a log and releases equipment back to `available`

### Testing Strategy
- Manual: Checkout a confirmed booking and confirm equipment status changes to `rented`
- Manual: Return equipment 3 days late and confirm late fee is calculated correctly
- Manual: Create maintenance log and confirm equipment cannot be booked while locked
- Manual: Complete maintenance log and confirm equipment status returns to `available`

### Potential Risks
- Late fee calculation must account for timezone differences in date comparisons — use UTC throughout
- Equipment status transitions must be strictly guarded to prevent invalid state jumps

---

## 💳 Phase 6 — Payment Integration, Invoices & Analytics

> Risk: 🔴 High | Complexity: ⭐⭐⭐⭐ 4/5

### Objective
Integrate Stripe for payment processing (simulated mode for portfolio demo), build the Payment model to track all financial transactions, generate PDF invoices, and implement the Admin analytics aggregation pipelines.

### Features / Modules
- Payment Mongoose schema tracking all transaction types
- Simulated payment flow (no real Stripe keys required for demo)
- Stripe integration scaffold ready for real keys
- PDF invoice generation utility
- Admin analytics: monthly revenue aggregation, equipment utilization rates
- Dashboard summary counts (active rentals, pending maintenance, total revenue)

### Files to be Created
| File | Purpose |
|---|---|
| `backend/src/models/Payment.js` | Mongoose schema: booking ref, amount, type, transaction ID, status |
| `backend/src/services/paymentService.js` | Stripe charge logic, simulated payment mode, refund processing |
| `backend/src/services/invoiceService.js` | Generate PDF invoice from booking + payment data |
| `backend/src/controllers/paymentController.js` | Payment endpoint handlers |
| `backend/src/controllers/analyticsController.js` | Aggregation pipeline endpoints |
| `backend/src/routes/paymentRoutes.js` | Payment endpoint definitions |
| `backend/src/routes/analyticsRoutes.js` | Analytics endpoint definitions (Admin only) |

### Files to be Modified
| File | Change |
|---|---|
| `backend/src/routes/index.js` | Mount paymentRoutes and analyticsRoutes |
| `backend/src/services/bookingService.js` | Trigger payment service after booking confirmed |

### Dependencies to Install
| Package | Reason |
|---|---|
| `stripe` | Official Stripe Node.js SDK |
| `pdfkit` | PDF generation for invoices |

### Deliverables
- Payment records created atomically with booking confirmation
- Simulated payment mode works without live Stripe keys
- PDF invoice downloadable for any completed booking
- `GET /api/v1/analytics/summary` returns dashboard KPIs (Admin only)
- `GET /api/v1/analytics/utilization` returns per-category utilization rates

### Testing Strategy
- Manual: Complete a booking flow and confirm a payment record is created
- Manual: Download invoice PDF and verify all billing fields are correct
- Manual: Hit analytics endpoints as Admin — confirm correct aggregated values
- Manual: Hit analytics endpoints as Customer — confirm 403 returned

### Potential Risks
- Stripe webhook reliability — must handle duplicate webhook events idempotently
- PDF library font/layout quirks across operating systems
- MongoDB aggregation pipeline complexity for revenue grouping by month

---

## 🎨 Phase 7 — Full Frontend Build (React + Vite + Tailwind)

> **Critical Milestone** | Risk: 🟡 Medium | Complexity: ⭐⭐⭐⭐⭐ 5/5

### Objective
Build the complete React frontend application. This is the largest phase by file count, split into logical sprints. The API is now fully tested and stable, so the frontend consumes real endpoints throughout.

### Sprint 7A — Foundation, Auth & Public Pages
**Features**: Vite + React + Tailwind setup, React Router layouts, Axios client, AuthContext, Home page, Catalog page, Equipment Detail page, Login/Register pages

**Files Created**:
- `frontend/` — full Vite scaffold
- `frontend/src/main.jsx` — React root mount
- `frontend/src/App.jsx` — Router with all layout routes
- `frontend/src/context/AuthContext.jsx` — Global session state
- `frontend/src/services/api.js` — Axios instance with interceptors
- `frontend/src/layouts/PublicLayout.jsx`
- `frontend/src/components/common/Navbar.jsx`
- `frontend/src/components/common/Footer.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Catalog.jsx`
- `frontend/src/pages/EquipmentDetail.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/components/ui/` — Button, Input, Badge, Modal, Spinner, Toast

### Sprint 7B — Customer Portal
**Features**: My Bookings page, Invoice viewer, Profile/Avatar editor, Protected route guards

**Files Created**:
- `frontend/src/layouts/CustomerLayout.jsx`
- `frontend/src/pages/customer/MyBookings.jsx`
- `frontend/src/pages/customer/BookingDetail.jsx`
- `frontend/src/pages/customer/Profile.jsx`
- `frontend/src/components/booking/BookingCard.jsx`
- `frontend/src/components/booking/InvoiceModal.jsx`

### Sprint 7C — Staff & Admin Portal
**Features**: Rentals Control Panel, Inventory CRUD Manager, Maintenance Manager, User Directory, Admin BI Dashboard with charts

**Files Created**:
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/components/common/AdminSidebar.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/InventoryManager.jsx`
- `frontend/src/pages/admin/UserDirectory.jsx`
- `frontend/src/pages/staff/RentalControl.jsx`
- `frontend/src/pages/staff/MaintenanceManager.jsx`
- `frontend/src/components/equipment/EquipmentFormModal.jsx`
- `frontend/src/components/equipment/EquipmentTable.jsx`
- `frontend/src/components/analytics/RevenueChart.jsx`
- `frontend/src/components/analytics/UtilizationChart.jsx`

### Dependencies to Install (Frontend)
| Package | Reason |
|---|---|
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client |
| `react-hook-form` | Form state management |
| `zod` | Client-side schema validation |
| `@hookform/resolvers` | Bridge between zod and react-hook-form |
| `recharts` | Charting library for BI dashboard |
| `react-hot-toast` | Toast notification system |
| `react-datepicker` | Availability date range picker |
| `@headlessui/react` | Accessible modal and dropdown components |
| `lucide-react` | Icon library |

### Deliverables
- Fully functional end-to-end application running locally
- Responsive across desktop and tablet viewports
- All auth flows working (register, login, logout, token refresh)
- Customer can browse, book, and view rentals
- Staff can checkout and return equipment
- Admin can manage inventory, users, and view analytics

### Testing Strategy
- Manual (Browser): Run through complete customer booking journey end-to-end
- Manual (Browser): Run through staff checkout and return workflow
- Manual (Browser): Create equipment as admin with image upload — verify Cloudinary URL
- Manual (Browser): Verify protected routes redirect unauthenticated users to login
- Manual (Browser): Verify role-based menus — Customer cannot see admin sidebar links

### Potential Risks
- State synchronization between AuthContext and React Router protected routes
- Axios interceptor refresh token loop can cause infinite retry if refresh endpoint itself fails — requires guard
- Chart library data format mismatches with API aggregation response shape

---

## 🚀 Phase 8 — Final Verification, Polish & Deployment Preparation

> Risk: 🟡 Medium | Complexity: ⭐⭐ 2/5

### Objective
Harden the application for public portfolio deployment. Final security audit, environment variable documentation, production build verification, and deployment configuration.

### Features / Modules
- Full end-to-end smoke test of all critical user flows
- Production environment variable documentation
- CORS locked to production frontend domain
- `NODE_ENV=production` error handler verified (no stack traces leaked)
- MongoDB Atlas connection verified
- Cloudinary production bucket configured
- Deployment manifests (for Render.com backend + Vercel frontend)

### Files to be Created
| File | Purpose |
|---|---|
| `backend/.env.example` | Final complete template with all production vars documented |
| `frontend/.env.example` | Final frontend env template |
| `README.md` | Professional README: setup guide, API docs overview, deployment instructions |

### Deliverables
- Application deployed and accessible at public URLs
- README suitable for GitHub portfolio presentation
- All environment secrets externalized — no hardcoded credentials

### Testing Strategy
- Manual: Full smoke test on deployed URLs (not localhost)
- Manual: Test HTTPS cookie behavior in production browser
- Manual: Verify rate limiter is active on deployed login endpoint

### Potential Risks
- CORS and cookie `secure` flag behavior differences between local and deployed environments
- Free-tier deployment platform cold start latency

---

## Summary Table

| Phase | Name | Risk | Complexity | Prerequisites |
|---|---|---|---|---|
| **0** | Project Initialization & Git | 🟢 Low | ⭐ 1/5 | None |
| **1** | Backend Foundation & Express | 🟡 Medium | ⭐⭐ 2/5 | Phase 0 |
| **2** | Authentication System | 🔴 High | ⭐⭐⭐ 3/5 | Phase 1 |
| **3** | Equipment Inventory | 🟡 Medium | ⭐⭐⭐ 3/5 | Phase 2 |
| **4** | Booking Engine | 🔴 High | ⭐⭐⭐⭐ 4/5 | Phase 3 |
| **5** | Return & Maintenance | 🟡 Medium | ⭐⭐⭐ 3/5 | Phase 4 |
| **6** | Payments & Analytics | 🔴 High | ⭐⭐⭐⭐ 4/5 | Phase 5 |
| **7** | Frontend Build | 🟡 Medium | ⭐⭐⭐⭐⭐ 5/5 | Phase 6 |
| **8** | Verification & Deployment | 🟡 Medium | ⭐⭐ 2/5 | Phase 7 |

### 🔴 Highest Risk Phases
1. **Phase 2** — Auth bugs compromise every subsequent feature
2. **Phase 4** — Booking engine concurrency bugs cause data corruption
3. **Phase 6** — Payment idempotency and Stripe webhook reliability

### 🏁 Critical Milestones
- ✅ Phase 1 Complete → Server boots and connects to DB
- ✅ Phase 2 Complete → All routes are securely protected
- ✅ Phase 4 Complete → Core business logic is proven correct
- ✅ Phase 7 Complete → Full product is usable end-to-end
- ✅ Phase 8 Complete → Portfolio-ready and publicly deployed

---

*Awaiting approval to begin **Phase 0: Project Initialization & Git Foundation**.*
