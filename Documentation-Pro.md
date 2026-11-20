# Farm Connect Codebase Documentation

## 1. Project Overview

Farm Connect is a full-stack direct farmer-to-consumer marketplace.
The frontend discovers farmers and products.
The Express backend exposes REST APIs.
PostgreSQL stores users, locations, products, orders, reviews, wishlists, and notifications.

## 2. Repository Folders

| Folder | Purpose |
|---|---|
| `frontend/` | Active Next.js frontend. Routes, React components, contexts, hooks, API helpers, and frontend configuration live here. |
| `backend/` | Active Express backend. API entry point, route modules, controllers, middleware, services, and database configuration live here. |
| `database/` | PostgreSQL schema, seed data, migrations, and SQL utilities. |
| `docs/` | Architecture diagrams and generated documentation sources. |
| `src/` | Legacy root application prototype. It is retained for compatibility and is not the canonical backend. |
| `node_modules/`, `frontend/node_modules/`, `backend/node_modules/` | Installed dependencies. These folders should not be edited directly. |

Evidence:
- Frontend structure: `frontend/src/app/`, `frontend/src/components/`, `frontend/src/context/`, `frontend/src/lib/`
- Canonical backend entry point: `backend/src/app.js`
- Database schema: `database/schema.sql`
- Root entry point forwarding note: `server.js`
- Legacy prototype warning: `src/app.js`

## 3. Technology Stack

### Frontend

| Technology | Version or use | Declared in |
|---|---|---|
| Next.js | 16.2.4; App Router | `frontend/package.json` |
| React | 19.2.4 | `frontend/package.json` |
| TypeScript | 5.x; strict mode enabled | `frontend/package.json`, `frontend/tsconfig.json` |
| Tailwind CSS | 3.4.4; theme and dark mode | `frontend/package.json`, `frontend/tailwind.config.ts` |
| Axios | 1.15.0; HTTP client and interceptors | `frontend/package.json`, `frontend/src/lib/api-client.ts` |
| React Leaflet | 5.0.0; interactive maps | `frontend/package.json` |
| React Hook Form and Zod | Forms and validation | `frontend/package.json` |

Frontend routing uses Next.js App Router under `frontend/src/app/`.
The root layout and global providers are in `frontend/src/app/layout.tsx`.

### Backend

| Technology | Version or use | Declared in |
|---|---|---|
| Node.js | Server runtime | `backend/package.json` |
| Express | 4.19.2; REST API | `backend/package.json` |
| PostgreSQL `pg` | 8.11.5; connection pool | `backend/package.json`, `backend/src/config/database.js` |
| JWT | 9.0.3; authentication tokens | `backend/package.json` |
| bcrypt | 6.0.0; password hashes | `backend/package.json` |
| Cloudinary | 2.1.0; remote image storage | `backend/package.json` |
| Multer | 1.4.5-lts.1; multipart uploads | `backend/package.json` |
| Helmet | 7.1.0; HTTP security headers | `backend/package.json` |
| express-rate-limit | 7.2.0; API request limits | `backend/package.json` |
| express-validator | 7.3.2; request validation | `backend/package.json` |

The backend entry point is `backend/src/app.js`.
It mounts route modules under `/api/v1`.

### Database

| Technology | Evidence |
|---|---|
| PostgreSQL | `database/schema.sql` |
| Supabase PostgreSQL | `backend/.env.example` |
| Haversine distance | `database/schema.sql`, `backend/src/services/location.service.js` |

The schema defines farmer, consumer, product, order, OTP, review, wishlist, notification, and admin data.
The exact table inventory should be read from `database/schema.sql`; the schema file is the source of truth.

## 4. Backend Structure

| Folder | Responsibility |
|---|---|
| `backend/src/routes/` | Maps HTTP paths to route handlers. |
| `backend/src/controllers/` | Handles selected HTTP requests, such as authentication, health, reviews, stock, wishlists, notifications, and admin operations. |
| `backend/src/services/` | Contains business logic and database operations. |
| `backend/src/middleware/` | JWT authentication, role authorization, sanitization, and uploads. |
| `backend/src/config/database.js` | Creates the PostgreSQL pool and transaction helper. |

Examples:
- Product routes: `backend/src/routes/products.js`
- Location and radius logic: `backend/src/services/location.service.js`
- JWT authentication: `backend/src/middleware/auth.js`
- Role authorization: `backend/src/middleware/roleAuth.js`

## 5. Frontend Structure

| Folder | Responsibility |
|---|---|
| `frontend/src/app/` | App Router pages and layouts for consumer, farmer, and admin areas. |
| `frontend/src/components/` | Shared and role-specific React components. |
| `frontend/src/context/` | Authentication, cart, location, theme, and toast state. |
| `frontend/src/hooks/` | Reusable geolocation, notification, local storage, and debounce hooks. |
| `frontend/src/lib/` | Axios clients and API/helper modules. |
| `frontend/src/types/` | Shared frontend TypeScript types. |

The global layout wraps the application with authentication, location, cart, toast, theme, Axios, and layout providers in `frontend/src/app/layout.tsx`.

## 6. Frontend to Backend Connection

The frontend uses Axios with `NEXT_PUBLIC_API_URL`.

- Default development API: `http://localhost:5000/api/v1`
- Production API: `https://farm-connect-backend-n7st.onrender.com/api/v1`
- Frontend API client: `frontend/src/lib/api-client.ts`
- Additional API helper: `frontend/src/lib/api.ts`
- Production environment declaration: `frontend/.env.production`
- Production Next.js override: `frontend/next.config.ts`

The frontend can call endpoints such as:

- `GET /api/v1/products`
- `POST /api/v1/auth/...`
- `/api/v1/orders/...`
- `/api/v1/farmer/...`
- `/api/v1/admin/...`

The mounted route list is in `backend/src/app.js`.

UNCLEAR: `frontend/.env.local` declares port `4000`, while `frontend/src/lib/api-client.ts` and `frontend/src/lib/api.ts` default to port `5000`. The effective port depends on environment loading and deployment configuration.

## 7. Authentication Flow

1. The frontend authenticates through backend auth routes.
2. The backend issues a JWT.
3. `AuthContext` stores the token, user, and role in `localStorage`:
   `frontend/src/context/AuthContext.tsx`
4. Axios sends the token as `Authorization: Bearer <token>`:
   `frontend/src/lib/api-client.ts`
5. `authenticateToken` verifies the JWT:
   `backend/src/middleware/auth.js`
6. Role middleware checks consumer, farmer, or admin access:
   `backend/src/middleware/roleAuth.js`

## 8. Backend to Database Connection

The backend creates a PostgreSQL connection pool using `DATABASE_URL`:

- Pool implementation: `backend/src/config/database.js`
- Environment template: `backend/.env.example`
- SQL schema: `database/schema.sql`

The pool supports:
- Normal parameterized queries
- Dedicated clients
- Atomic transactions using `BEGIN`, `COMMIT`, and `ROLLBACK`

Example data flow:

```text
Browser
  -> Next.js page/component
  -> Axios API client
  -> Express route
  -> service/controller
  -> PostgreSQL pool
  -> PostgreSQL database
  -> JSON response
  -> React UI
```

Example product flow:

```text
GET /api/v1/products
  -> backend/src/routes/products.js
  -> backend/src/services/location.service.js
  -> calculate_distance_km() in PostgreSQL
  -> mapped product JSON
  -> frontend
```

The product route maps snake_case database fields to camelCase fields before returning JSON:
`backend/src/routes/products.js`.

## 9. External Services

| Service | Use | Evidence |
|---|---|---|
| Supabase | Hosted PostgreSQL | `backend/.env.example` |
| Cloudinary | Product and profile image storage | `backend/package.json`, `backend/src/services/cloudinary.service.js` |
| Render | Production backend host | `frontend/next.config.ts`, `README.md` |
| Vercel | Production frontend host | `frontend/next.config.ts`, `README.md` |
| Railway | Alternate backend deployment | `railway.toml` |

The database host and external-service secrets are read from environment variables.
UNCLEAR: whether production currently serves through Render or Railway is not represented by one authoritative deployment file.

## 10. Canonical Entry Points

Use these as the primary code paths:

1. Frontend: `frontend/src/app/layout.tsx`
2. Frontend dependencies: `frontend/package.json`
3. Backend: `backend/src/app.js`
4. Backend dependencies: `backend/package.json`
5. Database configuration: `backend/src/config/database.js`
6. Database schema: `database/schema.sql`

The root `server.js` forwards to `backend/src/app.js`.
The root `src/app.js` is marked deprecated and should not be used for new backend work.

## 11. Login Flow: Consumer and Farmer OTP

The consumer and farmer login pages use the same two-step OTP flow. The UI sends a `userType` value to distinguish the account type.

### Step 1: User requests an OTP

1. The user enters a phone number and submits the form (`Continue`).
   - Consumer UI: `frontend/src/app/login/page.tsx`
   - Farmer UI: `frontend/src/app/farmer/login/page.tsx`
2. The page validates the phone in the browser, then sends:

   ```http
   POST /api/v1/auth/send-otp
   Content-Type: application/json

   {
     "phone": "<entered phone>",
     "userType": "consumer",
     "action": "login"
   }
   ```

   The farmer page sends `"userType": "farmer"`.
3. `backend/src/app.js` mounts the auth router at `/api/v1/auth`. JSON parsing and input sanitization run before route handling.
4. `backend/src/routes/auth.routes.js` validates the phone, `userType`, and `action`, then dispatches to `sendOTP` in `src/controllers/authController.js`. This is a legacy-root controller imported by the active backend route.
5. `sendOTP` checks for the phone in the `farmers` or `consumers` table using `src/config/db.js`. A login request for a phone not found returns an error. For an existing number, it finds or generates a five-minute OTP and upserts it into `otp_store`.
   - OTP table definition: `database/schema.sql`
   - SMS dispatch: `src/services/smsservice.js`
6. On success, the API returns `{ success: true, message: "OTP sent successfully" }`. The page changes to the OTP-entry screen and starts its resend timer.

### Step 2: User verifies the OTP

1. The user enters six digits. Once all digits are entered (or a six-digit code is pasted), the page sends:

   ```http
   POST /api/v1/auth/verify-otp

   {
     "phone": "<entered phone>",
     "otp": "<six digits>",
     "userType": "consumer"
   }
   ```

   The farmer page uses `"userType": "farmer"`.
2. `backend/src/routes/auth.routes.js` validates the request and dispatches to `verifyOTP` in `src/controllers/authController.js`.
3. `verifyOTP` queries `otp_store` by phone and user type, checks expiry, and compares the submitted OTP. On a correct OTP, it queries the matching user table for `id`, `phone`, and `name`, then deletes the used OTP.
4. The controller signs a JWT with the user's ID, phone, and role, using `JWT_SECRET` and `JWT_EXPIRES_IN` from the backend environment.
5. The successful response shape is:

   ```json
   {
     "success": true,
     "message": "OTP verified successfully",
     "data": {
       "token": "<JWT>",
       "user": { "id": 1, "phone": "...", "name": "..." },
       "requiresProfileCompletion": false
     }
   }
   ```

   The controller sets `requiresProfileCompletion` to false for login; it is true for registration.
6. The frontend calls `login(token, user, role)` from `frontend/src/context/AuthContext.tsx`. That stores the token, user, and role in `localStorage`, and sets Axios's default authorization header.
7. The consumer is redirected to the `redirect` query parameter or `/marketplace`; the farmer is redirected to the `redirect` query parameter or `/farmer/dashboard`. Both pages route to `/complete-profile` if the response requires completion.

### Failure handling

- Invalid request fields are rejected by the route validator in `backend/src/routes/auth.routes.js`.
- Missing/expired/wrong OTP responses come from `src/controllers/authController.js`; wrong attempts are counted and can trigger a 15-minute lockout.
- Errors passed to Express `next(error)` reach the global error handler in `backend/src/app.js`.
- The pages display API errors and allow the user to request another OTP.

### Admin login is separate

`frontend/src/app/admin/login/page.tsx` submits email and password to `POST /api/v1/admin/login`. `backend/src/app.js` mounts the admin router, `backend/src/routes/admin.routes.js` dispatches the public login route to `adminLogin` in `backend/src/controllers/admin.controller.js`. The controller queries the `admins` table through `backend/src/config/database.js`, checks the stored password hash with bcrypt, signs an admin JWT, and returns it in `data.token`. The UI stores that token through `AuthContext` and redirects to `/admin/dashboard`. The admin login does not use OTP.

## 12. API Endpoint Inventory

This list covers routes mounted by the canonical backend in `backend/src/app.js`. The root `server.js` starts that backend. The deprecated `src/app.js` prototype and unmounted service functions are not counted as active endpoints. The backend uses PostgreSQL through `pg` and raw SQL (`backend/src/config/database.js`), so the table lists SQL tables rather than ORM model names.

“Tables touched” means the SQL tables read or written by the route's current handler/service. `None` means the route handler does not query a table. External services are called out separately.

### Health and service metadata

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| GET | `/` | Return API name, version, and running status. | None |
| GET | `/health` | Check backend and database health. | No application table; runs `SELECT 1` |
| GET | `/api/health` | Return a simple API health response. | None |

Source: [backend/src/app.js](./backend/src/app.js), [backend/src/controllers/health.controller.js](./backend/src/controllers/health.controller.js)

### Authentication

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| POST | `/api/v1/auth/send-otp` | Validate account phone and issue/send OTP for login or registration. | `farmers` or `consumers`, `otp_store`; SMS provider |
| POST | `/api/v1/auth/verify-otp` | Verify OTP; on login return a JWT and user, on registration create the account. | `otp_store`, plus `farmers` or `consumers` |
| GET | `/api/v1/auth/demo-otp/:phone` | Return an OTP in configured demo mode when the `x-demo-secret` header matches. | `otp_store` |
| POST | `/api/v1/auth/complete-registration` | Update the authenticated farmer or consumer profile. | `farmers` or `consumers` |
| GET | `/api/v1/auth/me` | Return the authenticated user's profile and role. | `farmers` or `consumers` |

Source: [backend/src/routes/auth.routes.js](./backend/src/routes/auth.routes.js), [src/controllers/authController.js](./src/controllers/authController.js), [backend/src/controllers/auth.controller.js](./backend/src/controllers/auth.controller.js), [src/config/db.js](./src/config/db.js)

### Marketplace and farmer discovery

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| GET | `/api/v1/products` | List active products with optional location, search, category, price, and organic filters. | `products`, `farmers` |
| GET | `/api/v1/products/:id` | Return a product and its farmer/location details. | `products`, `farmers` |
| GET | `/api/v1/farmers/nearby` | Find verified active farmers within a fixed 50 km radius; returns at most three. | `farmers` |

Source: [backend/src/routes/products.js](./backend/src/routes/products.js), [backend/src/routes/farmer.routes.js](./backend/src/routes/farmer.routes.js), [backend/src/services/location.service.js](./backend/src/services/location.service.js)

### Orders

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| POST | `/api/v1/orders/place` | Consumer creates an order after stock validation; updates stock and notifies the farmer. | `products`, `farmers`, `orders`, `notifications` |

Source: [backend/src/routes/orders.js](./backend/src/routes/orders.js), [backend/src/services/order.service.js](./backend/src/services/order.service.js), [backend/src/services/notification.service.js](./backend/src/services/notification.service.js)

### Farmer workspace

All routes below are mounted under `/api/v1/farmers`. Except `/nearby`, these routes require a valid farmer JWT.

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| GET | `/api/v1/farmers/products/low-stock` | List the farmer's active products below their stock threshold. | `products` |
| PATCH | `/api/v1/farmers/products/:id/threshold` | Change a product's low-stock alert threshold. | `products` |
| GET | `/api/v1/farmers/rating-summary` | Return approved review summary for the farmer's products. | `product_reviews`, `products` |
| GET | `/api/v1/farmers/dashboard` | Return farmer order, sales, product, and revenue statistics. | `farmers`, `orders`, `products`, `consumers` |
| GET | `/api/v1/farmers/orders` | List the farmer's orders, optionally filtered by status. | `orders`, `consumers` |
| PATCH | `/api/v1/farmers/orders/:id/status` | Advance an owned order through its allowed status transitions and notify relevant users. | `orders`, `notifications` |
| GET | `/api/v1/farmers/products` | List products owned by the authenticated farmer. | `products` |
| POST | `/api/v1/farmers/products` | Create a product for the authenticated farmer. | `products` |
| PUT | `/api/v1/farmers/products/:id` | Update an owned product. | `products` |
| DELETE | `/api/v1/farmers/products/:id` | Delete an owned product. | `products` |

Source: [backend/src/routes/farmer.routes.js](./backend/src/routes/farmer.routes.js), [backend/src/controllers/stock.controller.js](./backend/src/controllers/stock.controller.js), [backend/src/services/stock.service.js](./backend/src/services/stock.service.js), [backend/src/services/dashboard.service.js](./backend/src/services/dashboard.service.js), [backend/src/services/order.service.js](./backend/src/services/order.service.js), [backend/src/services/review.service.js](./backend/src/services/review.service.js)

### Wishlist, reviews, and notifications

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| GET | `/api/v1/wishlist` | List the consumer's saved products. | `consumer_wishlist`, `products`, `farmers` |
| POST | `/api/v1/wishlist` | Toggle a product in or out of the consumer's wishlist. | `consumer_wishlist` |
| GET | `/api/v1/reviews/product/:id` | List approved reviews and rating summary for a product. | `product_reviews`, `consumers`, `products` |
| POST | `/api/v1/reviews` | Submit a review for a product in a completed/delivered order. | `orders`, `product_reviews` |
| GET | `/api/v1/reviews/can-review` | Check whether the consumer already reviewed that product/order pair. | `product_reviews` |
| GET | `/api/v1/notifications` | List the authenticated user's notifications. | `notifications` |
| PATCH | `/api/v1/notifications/read` | Mark all notifications for the authenticated user as read. | `notifications` |
| PATCH | `/api/v1/notifications/:id/read` | Mark one owned notification as read. | `notifications` |

Wishlist routes require a consumer JWT. Review reads are public; review creation and eligibility checks require a consumer JWT. Notification routes require a JWT.

Source: [backend/src/routes/wishlist.routes.js](./backend/src/routes/wishlist.routes.js), [backend/src/controllers/wishlist.controller.js](./backend/src/controllers/wishlist.controller.js), [backend/src/services/wishlist.service.js](./backend/src/services/wishlist.service.js), [backend/src/routes/review.routes.js](./backend/src/routes/review.routes.js), [backend/src/controllers/review.controller.js](./backend/src/controllers/review.controller.js), [backend/src/services/review.service.js](./backend/src/services/review.service.js), [backend/src/routes/notification.routes.js](./backend/src/routes/notification.routes.js), [backend/src/controllers/notification.controller.js](./backend/src/controllers/notification.controller.js)

### Administration

Admin routes below `/api/v1/admin` are public only for login; the remaining routes require an admin, super-admin, or moderator role.

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| POST | `/api/v1/admin/login` | Verify admin email/password and issue an admin JWT. | `admins` |
| GET | `/api/v1/admin/analytics` | Return platform counts and order/revenue metrics. | `farmers`, `consumers`, `products`, `orders` |
| GET | `/api/v1/admin/platform-analytics` | Return platform counts and order/revenue metrics. | `farmers`, `consumers`, `products`, `orders` |
| GET | `/api/v1/admin/farmers` | List farmers; `?status=pending` also includes product counts for pending farmers. | `farmers`; `products` when pending |
| PATCH | `/api/v1/admin/farmers/:id/suspend` | Deactivate a farmer account. | `farmers` |
| PATCH | `/api/v1/admin/farmers/:id/reinstate` | Reactivate a farmer account. | `farmers` |
| GET | `/api/v1/admin/verifications/pending` | List pending farmers with product counts. | `farmers`, `products` |
| POST | `/api/v1/admin/verifications/:farmerId/approve` | Approve a farmer and notify them. | `farmers`, `notifications` |
| POST | `/api/v1/admin/verifications/:farmerId/reject` | Reject a farmer and notify them. | `farmers`, `notifications` |
| GET | `/api/v1/admin/consumers` | List consumers. | `consumers` |
| GET | `/api/v1/admin/orders` | List orders with farmer and consumer names. | `orders`, `farmers`, `consumers` |

Both analytics routes currently call the same `getPlatformAnalytics` function in `backend/src/services/admin.service.js`.

Source: [backend/src/routes/admin.routes.js](./backend/src/routes/admin.routes.js), [backend/src/controllers/admin.controller.js](./backend/src/controllers/admin.controller.js), [backend/src/services/admin.service.js](./backend/src/services/admin.service.js)

### Image upload

| Method | Endpoint | Purpose | Tables / external services |
|---|---|---|---|
| POST | `/api/v1/upload/image` | Upload one authenticated request image and return its URL. | No SQL table; Cloudinary |

Source: [backend/src/routes/upload.routes.js](./backend/src/routes/upload.routes.js), [backend/src/middleware/upload.js](./backend/src/middleware/upload.js), [backend/src/services/cloudinary.service.js](./backend/src/services/cloudinary.service.js)

UNCLEAR: API paths documented in frontend helpers that are not mounted by `backend/src/app.js` are not included here. Check the backend route mounts before treating any additional path as an active endpoint.

## 13. Authentication and Authorization

Authentication establishes who the caller is. Authorization checks whether that caller's role may use a route. The backend enforces access; frontend route guards are for navigation and user experience, not a security boundary.

### How users authenticate

- **Consumers and farmers:** Phone OTP. `POST /api/v1/auth/send-otp` checks whether the phone exists in the selected account table, stores an OTP in `otp_store`, and sends it through the SMS service. `POST /api/v1/auth/verify-otp` checks the OTP and expiry; after success it creates an account for registration or loads the existing user for login. Wrong attempts are tracked in a process-local map and trigger a 15-minute lockout after five attempts. Sources: [backend/src/routes/auth.routes.js](./backend/src/routes/auth.routes.js), [src/controllers/authController.js](./src/controllers/authController.js), [src/services/smsservice.js](./src/services/smsservice.js).
- **Admins:** Email and password. `POST /api/v1/admin/login` loads an admin by email from `admins`, rejects inactive accounts, checks the password with `bcrypt.compare`, and issues a JWT. Source: [backend/src/controllers/admin.controller.js](./backend/src/controllers/admin.controller.js).

Both login paths sign JWTs with `JWT_SECRET`. Consumer/farmer expiry uses `JWT_EXPIRES_IN` or defaults to 30 days; admin expiry uses the same environment setting or defaults to 24 hours. Their token claims include `userId` and `role`; admin tokens also include `adminRole`. Sources: [src/controllers/authController.js](./src/controllers/authController.js), [backend/src/controllers/admin.controller.js](./backend/src/controllers/admin.controller.js).

### What the frontend does with the token

1. `AuthContext.login()` keeps token, user, and role in React state and `localStorage` (`auth_token`, `auth_user`, `auth_role`), then adds a default Bearer header to Axios. On reload, the context restores those values from `localStorage`. Source: [frontend/src/context/AuthContext.tsx](./frontend/src/context/AuthContext.tsx).
2. The API client in `frontend/src/lib/api-client.ts` also reads `auth_token` from `localStorage` and attaches it as `Authorization: Bearer <token>`. `frontend/src/lib/api.ts` has its own Axios instance with a similar request interceptor.
3. `ProtectedRoute` waits for the context to load, redirects unauthenticated users to login, and redirects users whose locally stored role is not allowed. It checks local state; the API still verifies each protected request. Source: [frontend/src/components/common/ProtectedRoute.tsx](./frontend/src/components/common/ProtectedRoute.tsx).
4. On a 401, the Axios clients clear some or all stored authentication values and redirect to `/login`. The exact cleanup differs between `frontend/src/lib/api-client.ts` and `frontend/src/lib/api.ts`.
5. `AuthContext.logout()` clears local state, storage, and the default Axios header, then navigates to `/`. No token-revocation/logout route is mounted in `backend/src/app.js` or `backend/src/routes/auth.routes.js`; a copied JWT remains usable until it expires.

The admin login page currently takes the JWT from the API response but creates a local placeholder user (`id: 999`, `Super Admin`) instead of using the returned admin profile. Source: [frontend/src/app/admin/login/page.tsx](./frontend/src/app/admin/login/page.tsx).

### What the backend checks

`authenticateToken` reads the Bearer token from the `Authorization` header, verifies it with `JWT_SECRET`, and assigns the decoded claims to `req.user`. Missing tokens return 401; expired or invalid tokens also return 401. Sources: [backend/src/middleware/auth.js](./backend/src/middleware/auth.js), [backend/src/app.js](./backend/src/app.js).

Then route middleware applies role checks:

| Route group | Backend requirement |
|---|---|
| `/api/v1/farmers/*` except `/nearby` | `authenticateToken` and exact role `farmer` via `requireRole('farmer')`. |
| `/api/v1/orders/*` | `authenticateToken` and exact role `consumer`. |
| `/api/v1/wishlist/*` | `authenticateToken` and role `consumer` via `roleAuth`. |
| `POST /api/v1/reviews` and `GET /api/v1/reviews/can-review` | `authenticateToken` and role `consumer` via `roleAuth`. |
| `/api/v1/admin/*` except `/login` | `authenticateToken` and one of `admin`, `super_admin`, or `moderator`. `roleAuth` checks both token `role` and `adminRole`. |
| `/api/v1/auth/me` and `/api/v1/auth/complete-registration` | `authenticateToken`; no additional role middleware is attached. |
| `/api/v1/notifications/*` | `authenticateToken`; notification queries are scoped to the token's `userId` and `role`. |
| `/api/v1/upload/image` | `authenticateToken`; no role middleware is attached. |

These policies are defined in [backend/src/routes/farmer.routes.js](./backend/src/routes/farmer.routes.js), [backend/src/routes/orders.js](./backend/src/routes/orders.js), [backend/src/routes/wishlist.routes.js](./backend/src/routes/wishlist.routes.js), [backend/src/routes/review.routes.js](./backend/src/routes/review.routes.js), [backend/src/routes/admin.routes.js](./backend/src/routes/admin.routes.js), [backend/src/routes/auth.routes.js](./backend/src/routes/auth.routes.js), [backend/src/routes/notification.routes.js](./backend/src/routes/notification.routes.js), and [backend/src/routes/upload.routes.js](./backend/src/routes/upload.routes.js).

### Public and specially gated routes

Product reads, nearby-farmer discovery, product-review reads, OTP send/verify, admin login, and health endpoints do not require a JWT in their route definitions. The demo OTP route is not JWT-protected; its controller requires `OTP_DEMO_MODE=true` and a matching `x-demo-secret` header. Sources: the route files above and [src/controllers/authController.js](./src/controllers/authController.js).

UNCLEAR: `frontend/src/components/common/ProtectedRoute.tsx` exists, but not every frontend page is wrapped with it. Backend route middleware remains the source of truth for API access.

## 14. Weak Points and 10× Growth Improvements

These are code-based risks, not measured production bottlenecks. The repository does not establish current traffic, database size, latency targets, or load-test results; use profiling and load tests to validate priorities.

### Highest-priority improvements

| Priority | Observed in code | What I would change |
|---|---|---|
| Correctness and trust boundaries | `POST /api/v1/orders/place` passes `req.body` directly to `placeOrder`; the service reads `consumerId` and item prices from that data. It checks available stock, but the shown flow does not validate positive integer quantities or retrieve authoritative prices from the database. Sources: [backend/src/routes/orders.js](./backend/src/routes/orders.js), [backend/src/services/order.service.js](./backend/src/services/order.service.js). | Take the consumer ID from `req.user.userId`; load product ownership, active state, stock, and prices from PostgreSQL inside the transaction; validate quantity and compute totals on the server. |
| One canonical backend | Active `backend/src/routes/auth.routes.js` imports OTP handlers from the legacy root `src/controllers/authController.js`, which uses a separate pool in `src/config/db.js`. The canonical backend also creates a pool in `backend/src/config/database.js`. | Move OTP auth and its DB access into `backend/src/`, use the canonical pool, and retire duplicate legacy paths after callers/tests are migrated. This reduces ownership ambiguity and makes connection budgets easier to calculate. |
| Shared state for multiple instances | OTP lockout attempts are held in a process-local `Map` in `src/controllers/authController.js`. The global limiter in `backend/src/app.js` is configured without a shared store. Limits can therefore diverge between backend instances. | Use a shared store such as Redis for rate-limit counters and OTP lockout state before horizontal autoscaling. |
| Bounded marketplace queries | `GET /api/v1/products` returns the full result set from `getProductsInRadius` without a page/limit. Its radius filter applies `calculate_distance_km(...)` to farmer coordinates; `database/schema.sql` has a latitude/longitude B-tree index, but the function predicate may still require many distance calculations. Sources: [backend/src/routes/products.js](./backend/src/routes/products.js), [backend/src/services/location.service.js](./backend/src/services/location.service.js), [database/schema.sql](./database/schema.sql). | Add bounded pagination and inspect query plans with representative data. If distance search is expensive, prefilter by a coordinate bounding box or evaluate a spatial type/index such as PostGIS, then confirm with `EXPLAIN (ANALYZE, BUFFERS)`. |
| Database connection budget | `backend/src/config/database.js` allows up to 10 pooled connections per production process. Multiple replicas multiply that total. | Load-test with the expected replica count, set a connection budget against the database's limit, and use a managed pooler if needed. Add query/connection saturation monitoring before raising pool limits. |
| Request error path reliability | The product-list catch handler synchronously writes to a developer-specific absolute Windows path before sending an error response. If that path is unavailable, the error logger itself can throw. Source: [backend/src/routes/products.js](./backend/src/routes/products.js). | Replace this with structured application logging and centralized error handling; do not make a local file write part of the HTTP failure path. |
| Session and API consistency | The frontend stores JWTs in `localStorage` (`frontend/src/context/AuthContext.tsx`) and has multiple Axios instances (`frontend/src/lib/api-client.ts`, `frontend/src/lib/api.ts`). API base URLs are also declared in `frontend/next.config.ts` and `frontend/.env.local`. | Consolidate HTTP calls and auth/error handling behind one typed API client. Review an HttpOnly, Secure, SameSite cookie session design (including CSRF protection) if the deployment allows it; otherwise keep localStorage use tightly scoped and maintain strong XSS defenses. Centralize environment-specific API URL configuration. |

### What I would do for 10× users

1. **Establish a baseline:** add request latency/error metrics, DB pool and slow-query monitoring, then load-test marketplace browsing and order placement. The current backend entry point has Morgan request logs, but the inspected runtime does not show metrics or distributed tracing (`backend/src/app.js`).
2. **Fix correctness before adding capacity:** make order identity, price, stock, and quantity server-authoritative as described above; add integration tests for concurrent orders and authorization boundaries.
3. **Make app instances interchangeable:** move OTP/rate-limit state to a shared store and avoid process-local state as a source of truth.
4. **Protect PostgreSQL:** cap response sizes, add pagination, optimize measured query plans, and calculate the total connection budget across replicas.
5. **Scale external work independently:** if SMS, image uploads, or notification writes become latency bottlenecks, measure them separately and add retries/queues where delivery semantics require it. Current upload handling calls Cloudinary in the request path (`backend/src/routes/upload.routes.js`); notification creation writes directly to PostgreSQL (`backend/src/services/notification.service.js`).
6. **Expand automated confidence:** `frontend/package.json` defines lint/build scripts but no test script; `backend/package.json` defines focused and integration test scripts. Add frontend/API contract tests and run representative integration/load tests in CI before large scale changes.

These are the first changes I would discuss in an interview because they connect concrete code observations to correctness, reliability, and capacity rather than assuming that 10× traffic requires a rewrite.
