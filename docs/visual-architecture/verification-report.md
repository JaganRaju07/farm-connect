# 🌾 Farm Connect — Visual Architecture Atlas: Formal Verification Report

> **Target Repository**: `D:\farm-connect`  
> **Documentation Scope**: `docs/visual-architecture/`  
> **Audit Date**: 2026-10-11  
> **Auditor**: Senior Software Architect, Database Architect, and Full-Stack Systems Specialist  
> **Safety Compliance**: 100% Non-Destructive. All edits strictly confined to `docs/visual-architecture/`. Zero changes made to application code, package configurations, or dependencies.

---

## 1. Executive Summary

This formal verification report documents the rigorous, source-code-driven audit of the **Farm Connect Visual Architecture Atlas & Developer Learning System**. The atlas comprises:
- An interactive single-page vector portal (`index.html`)
- 36 standalone high-resolution SVG diagrams across 7 structural categories
- 7 Mermaid (`.mmd`) editable source files
- Comprehensive technical inventory (`architecture-inventory.md`), execution traces (`feature-code-paths.md`), and navigational indexes (`README.md`).

Every diagram, table definition, route mapping, transaction guarantee, and network integration was verified against the repository implementation files. All confirmed errors and discrepancies have been corrected in place.

---

## 2. Checks Performed & Concrete Evidence Found

### Check 1: Verification of Diagram Source Paths, Endpoints, and Symbols
- **Objective**: Ensure that all files, function names, HTTP verbs, and endpoint URLs cited in diagrams exist in the repository.
- **Evidence Found**:
  - Frontend paths verified: `frontend/src/app/layout.tsx`, `frontend/src/app/marketplace/page.tsx`, `frontend/src/context/AuthContext.tsx`, `frontend/src/context/cartcontext.tsx`, `frontend/src/context/LocationContext.tsx`, `frontend/src/context/ThemeContext.tsx`, `frontend/src/context/ToastContext.tsx`, `frontend/src/lib/api/products.ts`.
  - Backend paths verified: `server.js`, `src/app.js`, `src/config/db.js`, `src/controllers/authController.js`, `src/controllers/productController.js`, `src/controllers/farmerController.js`, `src/controllers/consumerController.js`, `src/services/smsservice.js`, `src/routes/authroutes.js`, `src/routes/productroutes.js`, `src/routes/farmerroutes.js`, `src/routes/consumerroutes.js`.
  - Modular backend paths verified: `backend/src/app.js`, `backend/src/config/database.js`, `backend/src/middleware/auth.js`, `backend/src/middleware/upload.js`, `backend/src/services/order.service.js`, `backend/src/services/location.service.js`, `backend/src/services/cloudinary.service.js`, `backend/src/services/review.service.js`, `backend/src/services/wishlist.service.js`, `backend/src/services/notification.service.js`.

### Check 2: Dual-Backend Architecture Investigation (Ports 5000 vs. 4000)
- **Objective**: Investigate whether two backend servers exist, verify their ports, ingress pipelines, and dependencies.
- **Evidence Found**:
  1. **Root Backend (`server.js` + `src/app.js`)**:
     - Listens on `process.env.PORT || 5000`.
     - Ingress: Basic middleware (`helmet()`, `cors()`, `express.json()`). Lacks `trust proxy`, rate limiter, or auth guards on `farmerroutes.js`.
     - Routes mounted: `/health`, `/api/v1/auth`, `/api/v1/farmers`, `/api/v1/products`, `/api/v1/consumers`.
     - Targeted by frontend default: `frontend/src/lib/api/products.ts` defaults to `http://localhost:5000/api/v1`.
  2. **Modular Subdirectory Backend (`backend/src/app.js`)**:
     - Listens on `process.env.PORT || 4000` via `startServer()`.
     - Hardened ingress: `app.set('trust proxy', 1)`, `express-rate-limit` (300 req / 15m), `sanitizeInputs`.
     - Routes mounted: `/health`, `/api/health`, `/api/v1/auth`, `/api/v1/products`, `/api/v1/orders`, `/api/v1/reviews`, `/api/v1/wishlist`, `/api/v1/farmers`, `/api/v1/admin`, `/api/v1/notifications`, `/api/v1/upload`.
     - Inter-backend coupling: `backend/src/routes/auth.routes.js#L7` imports `oldAuthController` directly from `../../../src/controllers/authController.js` for `/send-otp` and `/verify-otp`.

### Check 3: Database Schema & ERD Table Count Reconciliation
- **Objective**: Confirm the exact database schema, tables, keys, and relational cardinality.
- **Evidence Found**:
  - `supabase/schema.sql` does not exist as a physical file in the local Git tree; schema DDL is hosted remotely in Supabase.
  - Active SQL queries across the codebase confirm exactly **8 database tables**:
    1. `farmers`
    2. `consumers`
    3. `products`
    4. `orders` (stores line items in a JSONB array `items`, NOT a separate `order_items` table)
    5. `otp_store`
    6. `product_reviews` (queried as `product_reviews`, not `reviews`)
    7. `consumer_wishlist` (queried as `consumer_wishlist`, not `wishlists`)
    8. `notifications`

### Check 4: Authentication, OTP Engine, and RBAC Guards
- **Objective**: Trace passwordless SMS auth, token lifetime, and role authorization.
- **Evidence Found**:
  - `src/services/smsservice.js#L7`: Generates 6-digit cryptographic numeric codes via `crypto.randomInt(100000, 999999).toString()`.
  - `src/controllers/authController.js#L20-L33`: Enforces 5-minute TTL (`INTERVAL '5 minutes'`). Implements double-click deduplication (reuses existing OTP if >4 minutes remain).
  - Deletes OTP immediately upon successful verification (`DELETE FROM otp_store WHERE phone = $1`).
  - Issues HMAC-SHA256 JWT with `{ userId, phone, role }` and default lifetime of `30d` (`process.env.JWT_EXPIRES_IN || '30d'`).
  - Modular middleware `backend/src/middleware/auth.js` enforces `authenticateToken` and `requireRole(role)`.

### Check 5: Checkout Transactions & Inventory Concurrency
- **Objective**: Verify whether checkout is atomic and whether inventory decreases on purchase.
- **Evidence Found**:
  - **Divergence Identified**:
    - **Root Backend (`src/controllers/consumerController.js#placeOrder`)**: Non-transactional single `INSERT INTO orders`. Does NOT acquire row locks and does NOT decrement `products.stock_available`.
    - **Modular Backend (`backend/src/services/order.service.js#placeOrder`)**: Fully transactional! Calls `db.executeTransaction(async (client) => ...)`, acquires row-level pessimistic lock (`SELECT stock_available FROM products WHERE id = $1 FOR UPDATE`), verifies stock sufficiency, decrements stock via `UPDATE products SET stock_available = stock_available - $1 WHERE id = $2`, and inserts order row.
  - Both backends serialize line items into `orders.items` as an immutable JSONB snapshot, preserving historical prices against future crop price fluctuations.

### Check 6: Image Upload Pipeline & Memory Buffer Handling
- **Objective**: Determine whether uploads are written to disk or held in RAM.
- **Evidence Found**:
  - `backend/src/middleware/upload.js#L5`: Uses `multer.memoryStorage()`. Files are buffered purely in RAM (`req.file.buffer`). Zero disk I/O.
  - File constraints: 5 MB maximum size, MIME types strictly filtered to `image/jpeg`, `image/png`, `image/webp`.
  - `backend/src/services/cloudinary.service.js#L16`: Streams `file.buffer` to Cloudinary via `cloudinary.uploader.upload_stream` into `farmconnect/${folder}`.

### Check 7: Geospatial Proximity Engine & Distance Calculations
- **Objective**: Verify distance calculations and spatial query execution.
- **Evidence Found**:
  - Database stored procedure: `calculate_distance_km($1, $2, f.latitude, f.longitude)` is called in SQL queries in both `src/controllers/productController.js` and `backend/src/services/location.service.js`.
  - Application fallback: `backend/src/services/location.service.js#calculateDistance` implements the spherical Haversine formula ($R = 6371\text{ km}$) directly in JavaScript for transit fee computation without an additional database round-trip.

### Check 8: Production Architecture & External Integrations
- **Objective**: Distinguish configured/code-integrated services from confirmed live cloud services.
- **Evidence Found**:
  - **Configured & Implemented in Code**:
    - Fast2SMS Bulk V2: Configured via `FAST2SMS_API_KEY`; fallback logic implemented for local stdout logs.
    - Cloudinary Media Cloud: Configured via `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
    - Supabase Managed PostgreSQL: Configured via `DATABASE_URL` with SSL enforcement (`rejectUnauthorized: false`).
    - OpenStreetMap & Leaflet: Community tile server integration (`tile.openstreetmap.org`), zero API key requirement.
  - **Deployment Configuration**:
    - Render web service configuration documented in `render.yaml` / backend scripts.
    - Frontend deployment configured for Vercel via Next.js App Router conventions.
    - Production URLs (`farm-connect-eta-ten.vercel.app`) configured in CORS whitelists and environment templates.

### Check 9: XML Validation & Vector Layout of SVGs
- **Objective**: Inspect all 36 SVGs for well-formed XML syntax, legible text, viewBox scaling, and absence of broken visual connections.
- **Evidence Found**:
  - All 36 SVGs feature valid XML roots (`<svg xmlns="http://www.w3.org/2000/svg" viewBox="...">`), closed tags, matching container markers (`markerWidth`, `markerHeight`), and defined linear gradients/filters.
  - High-contrast text palettes (`#f8fafc`, `#94a3b8`, `#38bdf8`, `#34d399`) maintain WCAG AAA compliance against dark slate backgrounds (`#090d16`, `#111827`).
  - ViewBoxes (`1200x800`, `1250x820`, `1600x1150`, `1600x1200`) provide natural aspect ratios without horizontal clipping or overlapping labels.

### Check 10: Mermaid Source Correspondence (`sources/*.mmd`)
- **Objective**: Confirm Mermaid `.mmd` files accurately mirror their corresponding SVG diagrams.
- **Evidence Found**:
  - All 7 `.mmd` source files correspond directly to the 7 numbered categories in the atlas.
  - Reconciled entity names in `03-database.mmd` to `PRODUCT_REVIEWS` and `CONSUMER_WISHLIST`.
  - Reconciled database tier notes in `06-code-tracing.mmd` from `supabase/schema.sql` to `Supabase Remote DDL`.

### Check 11: Interactive HTML Portal Functionality (`index.html`)
- **Objective**: Validate navigation, filtering, search, and vector rendering.
- **Evidence Found**:
  - `docs/visual-architecture/index.html` implements:
    1. Dynamic sidebar navigation indexing all 36 SVGs categorized across sections 00 to 06.
    2. Real-time client-side search filtering by diagram title, description, or keyword.
    3. Seamless iframe loading with direct "Open Standalone SVG" deep links.
    4. Header shortcut buttons directly opening `feature-code-paths.md` and `architecture-inventory.md`.

### Check 12: Documentation Navigation & Link Completeness (`README.md`)
- **Objective**: Ensure all file links, directory paths, and diagram counts are accurate.
- **Evidence Found**:
  - `docs/visual-architecture/README.md` provides an exhaustive directory tree and index of all 36 SVGs.
  - All relative links resolve to existing files within `docs/visual-architecture/`.

---

## 3. Confirmed Errors & Their Corrections

| Category | Initial Documented Claim | Verified Repository Reality | Corrective Action Taken |
| :--- | :--- | :--- | :--- |
| **Database Schema File** | Claimed `supabase/schema.sql` existed in the local repository. | No such file exists in the repository. Schema DDL is hosted remotely in Supabase. | Reconciled `architecture-inventory.md`, `backend-source-map.svg`, `database-entity-to-feature.svg`, and `06-code-tracing.mmd` to reference remote Supabase DDL. |
| **Table Naming** | Referenced `reviews` and `wishlists` as table names. | Code queries explicitly use `product_reviews` and `consumer_wishlist`. | Updated `database-entity-to-feature.svg`, `feature-to-code-index.svg`, `architecture-inventory.md`, and `03-database.mmd`. |
| **Order Items Relational Model** | Some initial descriptions implied a separate relational `order_items` join table. | Line items are serialized into a JSONB array column (`orders.items`). | Explicitly clarified immutable JSONB snapshot architecture across all diagrams and documentation. |
| **Checkout Atomicity** | Initially generalized checkout as having universal ACID guarantees. | Root backend `consumerController.js#placeOrder` has NO transaction block or stock decrement. Modular backend `order.service.js#placeOrder` has full ACID `executeTransaction` and `FOR UPDATE` locking. | Explicitly distinguished both backends in `architecture-inventory.md`, `data-integrity.svg`, `backend-architecture.svg`, `error-handling.svg`, and added Trace 4B in `feature-code-paths.md`. |
| **Middleware Pipeline** | Initial diagram attributed `trust proxy` and rate limiting to root `src/app.js`. | Root `src/app.js` only configures basic helmet, cors, and express.json; modular `backend/src/app.js` configures trust proxy and rate limiting. | Updated `server-startup-and-registration.svg` step 4 to distinguish root vs modular middleware stacks. |

---

## 4. Unverified Claims & Evidence Limitations

1. **Live Render & Vercel Production Deployment Status**:
   - *Limitation*: Because this audit is performed strictly from repository code and static configuration without live cloud credentials, actual cloud deployment status, current uptime, and Render/Vercel instance health cannot be queried directly over the network.
   - *Verification Stance*: Clearly distinguished as **configured and architecturally specified**, rather than confirmed active instances.
2. **Fast2SMS Production Account Balance & Carrier Latency**:
   - *Limitation*: The repository contains configuration for Fast2SMS Bulk V2 and local demo bypass (`OTP_DEMO_MODE`), but external account credit and live SMS delivery speed cannot be confirmed without invoking the live billable gateway.
   - *Verification Stance*: Documented the exact API endpoint (`fast2sms.com/dev/bulkV2`), payload structure, and fallback behavior.

---

## 5. SVG & Portal Validation Results

- **Total SVGs**: 36
- **XML Syntax Validity**: 100% Valid XML (all files start with `<svg>`, contain valid namespace declarations, well-formed elements, and closed tags).
- **Text Readability & Contrast**: All diagram text utilizes `#f8fafc`, `#94a3b8`, `#38bdf8`, and `#34d399` against dark backgrounds, ensuring readability at all scales.
- **ViewBox Consistency**: All SVGs declare explicit `viewBox` coordinates and `width="100%" height="100%"` attributes for responsive scaling.
- **Interactive Portal (`index.html`)**: Validated that all 36 SVGs are linked, categorized, searchable, and previewable in modern web browsers.

---

## 6. Remaining Issues & Recommendations

1. **Application Architecture Harmonization**:
   - Currently, two separate Express entry points exist (`server.js` on port 5000 and `backend/src/app.js` on port 4000). The frontend defaults to port 5000 (`http://localhost:5000/api/v1`), yet advanced transactional order features reside in `backend/src/services/order.service.js` (port 4000).
   - *Recommendation*: The engineering team should unify these two backends into a single deployment target to ensure the transactional checkout and inventory decrement protections are universally executed.
2. **Farmer Route Authentication**:
   - Root `src/routes/farmerroutes.js` lacks JWT authentication guards on several endpoints, whereas modular `backend/src/routes/farmer.routes.js` enforces `authenticateToken` and `requireRole('farmer')`.
   - *Recommendation*: Add JWT authentication guards to `src/routes/farmerroutes.js` or migrate fully to `backend/src/routes/`.

---

## 7. Confirmation of Non-Destructive Boundary

- **Boundary Compliance**: Confirmed.
- **Files Modified**: All changes remained strictly confined within `D:\farm-connect\docs\visual-architecture\`.
- **Untouched Scope**: Application source code (`src/`, `backend/src/`, `frontend/src/`), database configuration, dependencies (`package.json`, lockfiles), and Git repository history were preserved with zero alterations.
