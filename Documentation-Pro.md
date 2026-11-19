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
