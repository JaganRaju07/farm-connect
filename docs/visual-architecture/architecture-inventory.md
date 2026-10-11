# 🌾 Farm Connect — Architectural Reconnaissance Inventory

> **Document Type**: Codebase Architectural Reconnaissance Inventory  
> **Status**: Verified via Direct Source-Code Inspection  
> **Target Repository**: `D:\farm-connect`  
> **Date of Audit**: October 2026  
> **Classification**: Internal Engineering & Developer Learning System Reference  

---

## 1. Executive Summary & Verification Methodology

This inventory documents the structural and runtime architecture of the **Farm Connect** codebase. All findings recorded herein are derived exclusively from direct static analysis of repository manifests, entry points, routing definitions, controller logic, middleware chains, database adapters, and TypeScript type declarations.

### Evidence Categorization
- **Primary Evidence**: Direct inspection of operational source code in `frontend/src/`, `src/`, `backend/src/`, `server.js`, `package.json`, and `frontend/package.json`.
- **Secondary Evidence**: Operational guidelines, architectural claims, and configuration references in `README.md`.
- **Dual-Backend Topology Note**: The repository contains two Express configurations:
  1. **Root Express API** (`server.js` + `src/`): Mounted on port 5000 (`/src/app.js`), implementing core routes for `/api/v1/auth`, `/api/v1/farmers`, `/api/v1/products`, and `/api/v1/consumers`.
  2. **Subdirectory Express API** (`backend/package.json` + `backend/src/`): Mounted on port 4000 (`backend/src/app.js`), featuring extended modular routing (`review.routes`, `wishlist.routes`, `notification.routes`, `upload.routes`, `admin.routes`, `database.js` connection pool with transaction helper).
  Both implementations connect to the same Supabase PostgreSQL instance and share consistent table structures.

---

## 2. Verified Architectural Components & Source Paths

### A. Frontend Tier (`frontend/`)

| Component / Subsystem | Primary Source Path | Implementation Details |
| :--- | :--- | :--- |
| **Framework & Build** | `frontend/package.json`<br>`frontend/next.config.ts` | Next.js `16.2.4`, React `19.2.4`, TypeScript `5`, Tailwind CSS `3.4.4`, Framer Motion `12.43.0`, GSAP `3.15.0`. Remote image patterns configured for Cloudinary (`res.cloudinary.com`) and Unsplash. |
| **Root Layout & Cascade** | `frontend/src/app/layout.tsx` | HTML5 root layout embedding client-side script for immediate theme resolution, wrapping the DOM tree in a 6-layer Provider Cascade: `ThemeProvider` → `AuthProvider` → `LocationProvider` → `ToastProvider` → `CartProvider` → `AxiosInterceptorWrapper` → `Header` → `{children}`. |
| **Landing & Discovery UI** | `frontend/src/app/page.tsx` | Client-side landing interface resolving browser GPS coordinates to determine the consumer's taluk/city and query nearby registered cultivators via `GET /api/v1/farmers/nearby`. Incorporates modular editorial sections: `HeroNarrative`, `WhatsGrowingAroundYou`, `FarmJourneyTimeline`, `LocalFarmNetwork`, and `FeaturedFarmersEditorial`. |
| **Marketplace Explorer** | `frontend/src/app/marketplace/page.tsx` | Central consumer product catalog supporting dual view modes (Grid View vs Leaflet Map View via `MapExplorer`), debounced keyword search (`300ms`), recent search history in `localStorage`, categorical filtering, price brackets, organic toggles, and radius expansion (`25km`, `50km`, `100km`). |
| **Global State: Auth** | `frontend/src/context/AuthContext.tsx` | React Context managing `user`, `token`, `role` (`consumer` \| `farmer` \| `admin`), and `isAuthenticated`. Synchronizes session state with `localStorage` (`auth_token`, `auth_user`, `auth_role`) and injects `Authorization: Bearer <token>` into `axios.defaults.headers.common`. |
| **Global State: Cart** | `frontend/src/context/cartcontext.tsx` | Persistent shopping cart backed by `localStorage` (`farmconnect_cart`). Implements client-side stock clamping (`Math.min(quantity, product.stockAvailable)`), subtotal accumulation, and item count calculations. |
| **Global State: Location** | `frontend/src/context/LocationContext.tsx`<br>`frontend/src/hooks/useGeolocation.ts` | Browser Geolocation API wrapper providing `{ latitude, longitude, accuracy, loading, error, refreshLocation }`. Configured with `enableHighAccuracy: true`, `timeout: 10000ms`, and `maximumAge: 300000ms` (5 minutes). |
| **Network & Interceptors** | `frontend/src/components/layout/AxiosInterceptorWrapper.tsx`<br>`frontend/src/lib/api/products.ts` | Global Axios request/response interceptors attaching bearer tokens and capturing HTTP 401/403 errors to trigger automatic session teardown and toast alerts. Dedicated typed API clients in `frontend/src/lib/api/`. |
| **TypeScript Contracts** | `frontend/src/types/index.ts`<br>`frontend/src/types/products.ts`<br>`frontend/src/types/order.ts`<br>`frontend/src/types/user.ts`<br>`frontend/src/types/farmer.ts` | Exhaustive domain contracts covering `Product`, `ProductCategory`, `ProductUnit`, `Order`, `OrderItem`, `OrderStatus`, `DeliveryAddress`, `User`, `UserRole`, `LocationState`, and `ApiResponse<T>`. |

---

### B. Backend Tier (`src/` & `backend/src/`)

| Subsystem | Verified Source Path | Implementation Details |
| :--- | :--- | :--- |
| **Root Entry Point** | `server.js` | Bootstraps Express on `process.env.PORT || 5000`, loads `.env`, requires `src/app.js`, and verifies `src/config/db.js`. |
| **Subdirectory Entry**| `backend/src/app.js` | Express 4 server on `process.env.PORT || 4000`, sets `trust proxy = 1`, configures `helmet`, origin-validated `cors`, `morgan` HTTP logging, `rateLimit` (300 requests/15min on `/api`), and `sanitizeInputs`. |
| **Database Pool (Root)**| `src/config/db.js` | PostgreSQL `pg.Pool` initialized from `process.env.DATABASE_URL` with conditional SSL (`rejectUnauthorized: false` in production). Executes immediate `SELECT NOW()` diagnostic query on boot. |
| **Database Pool (Sub)**| `backend/src/config/database.js` | Dedicated connection pool (`max: 10` in prod, `max: 5` in dev, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 2000`). Exports `query()`, `getClient()`, `pool`, `testConnection()`, and atomic transaction utility `executeTransaction(async (client) => ...)`. Authored by Jagan Raju B (Team P116). |
| **Authentication Controller**| `src/controllers/authController.js`<br>`backend/src/controllers/auth.controller.js` | Passwordless phone-based OTP engine. Handles `sendOTP` with active token reuse (lockout window > 4 mins), Fast2SMS delivery, table-level registration checks (`farmers` vs `consumers`), OTP verification against `otp_store`, default coordinate fallbacks for progressive onboarding, and 30-day JWT generation. |
| **Product Controller** | `src/controllers/productController.js` | Implements `searchNearbyProducts` executing PostgreSQL spatial function `calculate_distance_km($1, $2, f.latitude, f.longitude)` with radius thresholds, joins against `farmers`, and verifies `p.is_active = TRUE AND f.is_verified = TRUE`. Implements `getProductsByCategory`. |
| **Consumer Controller**| `src/controllers/consumerController.js` | Handles `registerConsumer`, `placeOrder` (calculates customer-to-farmer distance, generates order number `FC${Date.now()}`, inserts delivery location snapshot, and records JSONB line items), and `getOrderHistory`. |
| **Farmer Controller** | `src/controllers/farmerController.js` | Defines registration, dashboard metric endpoints, product CRUD (`addProduct`, `getAllProducts`, `updateProduct`, `deleteProduct`), and order queue retrieval (`getOrders`). |
| **SMS Service** | `src/services/smsservice.js` | Generates 6-digit numeric OTPs. Evaluates `OTP_DEMO_MODE=true` for console-logged bypass; calls Fast2SMS Bulk V2 API (`https://www.fast2sms.com/dev/bulkV2`) in production using `FAST2SMS_API_KEY`. |

---

## 3. Verified API Endpoint Catalog

```
                    ┌─────────────────────────┐
                    │    HTTP Client (Web)    │
                    └────────────┬────────────┘
                                 │
                   Bearer JWT / Query Params / JSON
                                 │
                                 ▼
                     /api/v1 Global Gateway
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
    /api/v1/auth          /api/v1/products        /api/v1/consumers
  - POST /send-otp       - GET /search           - POST /register
  - POST /verify-otp     - GET /category/:cat    - POST /orders
  - GET  /demo-otp/:ph   - GET / (marketplace)  - GET  /orders
                                 │
                                 ▼
                          /api/v1/farmers
                         - POST /register
                         - GET  /dashboard
                         - GET  /nearby
                         - GET  /products
                         - POST /products
                         - PUT  /products/:id
                         - DEL  /products/:id
                         - GET  /orders
```

### Detailed Endpoint Specifications

#### 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/send-otp`
  - **Body**: `{ phone: string, userType: "farmer" | "consumer", action: "login" | "register" }`
  - **Behavior**: Validates phone existence in respective table, queries `otp_store` to reuse unexpired codes (>4 min TTL), generates 6-digit code, upserts into `otp_store`, and transmits via Fast2SMS.
- `POST /api/v1/auth/verify-otp`
  - **Body**: `{ phone: string, otp: string, userType: string, name?: string, latitude?: number, longitude?: number, address?: string, city?: string }`
  - **Behavior**: Validates token match, checks expiry, performs progressive registration insertion with default coordinate fallbacks, deletes OTP from `otp_store`, signs JWT containing `{ userId, phone, role }`, and returns session payload.
- `GET /api/v1/auth/demo-otp/:phone`
  - **Headers**: `x-demo-secret: <OTP_DEMO_SECRET>`
  - **Behavior**: Protected debugging endpoint active only when `OTP_DEMO_MODE=true`.

#### 2. Products (`/api/v1/products`)
- `GET /api/v1/products/search?lat={lat}&lon={lon}&radius={km}`
  - **Query**: `lat` (float, required), `lon` (float, required), `radius` (float, default: 30)
  - **Behavior**: Runs `calculate_distance_km` in PostgreSQL against all active products from verified farmers within the radius, returning sorted records.
- `GET /api/v1/products/category/:categoryName`
  - **Params**: `categoryName` (string)
  - **Behavior**: Returns all active products under the specified category with joined farmer details.

#### 3. Farmers (`/api/v1/farmers`)
- `POST /api/v1/farmers/register` — Registers new cultivator storefront.
- `GET /api/v1/farmers/nearby?latitude={lat}&longitude={lon}` — Queries cultivators sorted by proximity.
- `GET /api/v1/farmers/dashboard` — Aggregates sales statistics and inventory alerts.
- `GET /api/v1/farmers/products` — Retrieves authenticated farmer's listed catalog.
- `POST /api/v1/farmers/products` — Adds new crop listing.
- `PUT /api/v1/farmers/products/:id` — Updates stock or pricing.
- `DELETE /api/v1/farmers/products/:id` — Soft-deactivates or deletes product listing.
- `GET /api/v1/farmers/orders` — Retrieves pending and active incoming orders.

#### 4. Consumers & Orders (`/api/v1/consumers`)
- `POST /api/v1/consumers/register` — Creates consumer profile with delivery location.
- `POST /api/v1/consumers/orders`
  - **Body**: `{ consumer_id, farmer_id, items, subtotal, delivery_fee, total_amount, consumer_notes }`
  - **Behavior**: Verifies consumer and farmer records, invokes `calculate_distance_km` to determine true transit distance, generates order ID `FC${Date.now()}`, and commits order with JSONB items snapshot.
- `GET /api/v1/consumers/orders?consumer_id={id}` — Fetches chronological order history.

---

## 4. Verified Database Schema & Entity Relationships

The data layer is hosted on Supabase PostgreSQL. Relational models are linked via integer primary/foreign keys and geographic coordinate pairs. Eight distinct tables are verified across the codebase query paths:

```
+--------------------+        +--------------------+
|      FARMERS       |        |     CONSUMERS      |
+--------------------+        +--------------------+
| id (PK)            |        | id (PK)            |
| name               |        | name               |
| phone (UNIQUE)     |        | phone (UNIQUE)     |
| latitude, longitude|        | email              |
| address, city      |        | latitude, longitude|
| is_verified        |        | delivery_address   |
| verification_status|        | city, pincode      |
| farming_type       |        | phone_verified     |
| phone_verified     |        +---------+----------+
+---------+----------+                  |
          |                             | 1:N
          | 1:N                         v
          v                   +--------------------+
+--------------------+        |       ORDERS       |
|      PRODUCTS      |        +--------------------+
+--------------------+        | id (PK)            |
| id (PK)            | 1:N    | order_number (UK)  |
| farmer_id (FK)-----+------->| consumer_id (FK)   |
| name               | (snap) | farmer_id (FK)     |
| category           |        | items (JSONB)      |
| description        |        | subtotal           |
| price, unit        |        | delivery_fee       |
| stock_available    |        | total_amount       |
| is_organic         |        | order_status       |
| is_active          |        | payment_status     |
| harvest_date       |        | delivery_lat/lon   |
+---------+----------+        | delivery_dist_km   |
          |                   | consumer_notes     |
          |                   +---------+----------+
          | 1:N                         |
          v                             v
+--------------------+        +--------------------+
|  PRODUCT_REVIEWS   |        |     OTP_STORE      |
+--------------------+        +--------------------+
| id (PK)            |        | phone (PK/UNIQUE)  |
| product_id (FK)    |        | otp_code           |
| consumer_id (FK)   |        | expires_at         |
| order_id (FK)      |        | user_type, action  |
| rating (1-5)       |        +--------------------+
| review_text        |
| review_images      |
| is_approved        |
+--------------------+

+--------------------+        +--------------------+
| CONSUMER_WISHLIST  |        |   NOTIFICATIONS    |
+--------------------+        +--------------------+
| id (PK)            |        | id (PK)            |
| consumer_id (FK)   |        | user_id, user_type |
| product_id (FK)    |        | title, message     |
| created_at         |        | notification_type  |
+--------------------+        | related_id / type  |
                              | is_read            |
                              +--------------------+
```

### Verified Table Catalog (8 Tables)
1. **`farmers`**: Cultivator accounts with GPS coordinates, verification status, and contact details.
2. **`consumers`**: Buyer accounts with default delivery address and GPS coordinates.
3. **`products`**: Crop listings with real-time `stock_available`, `price`, `unit`, and `primary_image_url`.
4. **`orders`**: Transaction records. Note: Order items are stored directly inside the **`items` JSONB column** (e.g. `[{"productId": 1, "quantity": 2, "price": 40}]`), freezing historical purchase prices without a separate `order_items` table.
5. **`otp_store`**: Ephemeral authentication tokens with 5-minute `expires_at` timestamp.
6. **`product_reviews`**: Verified customer reviews tied to `order_id` (preventing unverified reviews).
7. **`consumer_wishlist`**: Consumer bookmarked crop listings.
8. **`notifications`**: User alerts for order lifecycle transitions (`confirmed`, `packed`, `delivered`, `paid`).

### Cardinality Matrix
- `farmers (1) ── (N) products`: A farmer cultivates multiple products; each product belongs to one farmer.
- `farmers (1) ── (N) orders`: A farmer receives orders directly from local buyers.
- `consumers (1) ── (N) orders`: A consumer places multiple direct-to-farm orders.
- `products (1) ── (N) orders (as JSONB snapshots)`: Products are serialized into `orders.items` as JSONB snapshots to preserve historical pricing and product names at checkout time.
- `products (1) ── (N) product_reviews`: Each review references a product and verified `order_id`.
- `consumers (1) ── (N) consumer_wishlist`: Consumers save crops for quick access.
- `otp_store (1) ── (1) phone`: Single ephemeral record per phone number, upserted on re-request.

### Spatial Computation Function
```sql
-- Stored PostgreSQL function: calculate_distance_km(lat1, lon1, lat2, lon2)
-- Computes the great-circle distance between two geographic coordinates
-- using the spherical Haversine formula with Earth mean radius R = 6371 km.
-- Deployed directly on Supabase PostgreSQL (not stored in local migrations folder).
```

---

## 5. Major Full-Stack Feature Workflows

### Workflow 1: Passwordless Authentication & Session Initiation
1. **User Request**: User inputs phone number and selects role on `/login` or `/register`.
2. **Dispatch**: Frontend executes `POST /api/v1/auth/send-otp`.
3. **Storage & Delivery**: Backend checks for active unexpired OTP; generates 6-digit code if needed; updates `otp_store`; transmits via Fast2SMS.
4. **Verification**: User enters OTP; frontend sends `POST /api/v1/auth/verify-otp`.
5. **Token Issuance**: Backend validates OTP against `otp_store`, deletes record upon match, creates default record if progressive onboarding, and signs JWT.
6. **Client Storage**: `AuthContext` stores JWT in `localStorage` and configures Axios authorization header.

### Workflow 2: Hyperlocal Product Discovery & Radius Filtering
1. **Coordinate Capture**: `LocationProvider` invokes `navigator.geolocation.getCurrentPosition()`.
2. **Marketplace Load**: `/marketplace` page fires request to `/api/v1/products/search?lat={lat}&lon={lon}&radius={radius}`.
3. **Database Query**: Backend invokes `calculate_distance_km` in PostgreSQL, filtering out inactive listings and distances exceeding the radius threshold.
4. **Presentation**: Client renders products sorted by ascending distance, displaying precise badges (e.g., `"3.8 km away"`).
5. **Map Synchronization**: Toggling to "Map View" passes coordinates and product lists to `MapExplorer` (Leaflet), plotting pins on OpenStreetMap tiles.

### Workflow 3: Cart Management & Stock Validation
1. **Item Selection**: Consumer selects product quantity on `ProductCard`.
2. **Boundary Enforcement**: `CartProvider.addToCart` clamps quantity to `product.stockAvailable`.
3. **Local Persistence**: Cart state immediately serializes to `localStorage.farmconnect_cart`.
4. **Subtotal Calculation**: Dynamic accumulation of `quantity * price` across active items.

### Workflow 4: Order Creation, Inventory Safeguards & Geospatial Transit Snapshot
1. **Checkout Initiation**: Consumer reviews cart line items and navigates from `/cart` to `/checkout`.
2. **Payload Formulation**: Delivery address and GPS coordinates are bundled with cart items (`[{ productId, quantity, price, unit }]`).
3. **Backend Processing (Implementation Duality Confirmed)**:
   - **Root Backend (`src/controllers/consumerController.js` via `POST /api/v1/consumers/orders`)**:
     - Queries consumer and farmer GPS coordinates from database.
     - Invokes PostgreSQL stored procedure `calculate_distance_km` for transit distance.
     - Formats order number `FC${Date.now()}`.
     - Commits order with serialized JSON items (`JSON.stringify(items)` into `orders.items`).
     - *Audit Finding*: Operates without a `BEGIN/COMMIT` transaction wrapper and does *not* execute a stock decrement query.
   - **Modular Subdirectory Backend (`backend/src/services/order.service.js` via `POST /api/v1/orders/place`)**:
     - Executes inside `db.executeTransaction(async (client) => ...)` (`BEGIN` ... `COMMIT` / `ROLLBACK`).
     - Executes `SELECT id, stock_available, farmer_id FROM products WHERE id = $1 FOR UPDATE` to lock product rows against race conditions.
     - Validates stock ceiling (`stock_available >= requested quantity`).
     - Performs atomic stock decrement: `UPDATE products SET stock_available = stock_available - $1 WHERE id = $2`.
     - Calculates delivery transit distance in memory via Haversine `calculateDistance()`.
     - Commits order with frozen JSONB line items and triggers in-app notification.
4. **Confirmation**: Order confirmed; cart cleared in `CartProvider`; consumer redirected to order history.

---

## 6. External Services & Deployment Boundaries

```
[ End User Browser ] 
        │
        ├── HTTPS / HTML / JS
        ▼
[ Vercel Edge CDN ] ──── Next.js 16 App Router (Frontend)
        │
        ├── Axios REST API Calls (JSON with Bearer JWT)
        ▼
[ Render Cloud Host ] ─── Express 5 Node.js Server (Backend API)
        │
        ├── TCP Connection Pool (SSL enabled)
        ├──────────────────────────► [ Supabase PostgreSQL ]
        │
        ├── HTTPS REST (params)
        ├──────────────────────────► [ Fast2SMS Gateway ]
        │
        └── HTTPS Multipart Upload
        └──────────────────────────► [ Cloudinary CDN (Images) ]
```

### Environment Variable Contract (Keys Only — Zero Secret Values Exposed)

#### Frontend Environment (`frontend/.env.local` / Vercel):
- `NEXT_PUBLIC_API_URL` — Target REST API gateway (e.g., `http://localhost:5000/api/v1` or Render URL).

#### Backend Environment (`.env` / `backend/.env` / Render):
- `PORT` — HTTP listener port.
- `DATABASE_URL` — Supabase PostgreSQL connection string.
- `NODE_ENV` — Runtime environment toggle (`development` \| `production`).
- `ALLOWED_ORIGINS` — Comma-delimited CORS origin whitelist.
- `JWT_SECRET` — Secret key for signing session tokens.
- `JWT_EXPIRES_IN` — Token validity duration (default: `30d`).
- `FAST2SMS_API_KEY` — API token for the Fast2SMS gateway.
- `OTP_DEMO_MODE` — Boolean flag to bypass SMS transmission during automated testing.
- `OTP_DEMO_SECRET` — Secret header token for demo OTP inspection.
- `CLOUDINARY_URL` / `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — Cloudinary media credentials.

---

## 7. Evidence Limitations & Concrete Code Findings

1. **Dual Backend Synchronicity**: The repository hosts both root `src/` and `backend/src/`. The root backend represents the initial iteration (Port 5000), while `backend/src/` represents the refactored, production-ready modular service (Port 4000) documented in `backend/package.json` and the root `README.md`. Notably, `backend/src/routes/auth.routes.js` imports `oldAuthController` directly from `../../../src/controllers/authController`.
2. **Stored Procedure DDL**: The SQL definition for `calculate_distance_km` is actively invoked in `productController.js` and `location.service.js`, but its creation DDL is hosted directly in the remote Supabase PostgreSQL instance rather than versioned inside a local migrations directory.
3. **Checkout Transaction Safeguards**: Root `consumerController.js` creates orders with single `INSERT` statements without transaction blocks or stock decrements. In contrast, modular `order.service.js` executes inside `db.executeTransaction`, locks product rows with `FOR UPDATE`, validates available quantity, and performs atomic decrements.
4. **Local Schema Files**: The repository does not maintain local SQL migration files (such as `supabase/schema.sql`). All schema definitions are confirmed via active SQL query strings across services and controllers.
5. **Physical Order Items Table vs JSONB**: In contrast to traditional relational schemas with a separate `order_items` table, the code commits line items directly into the `orders.items` column serialized as JSONB to permanently freeze product names, units, and purchase prices.
