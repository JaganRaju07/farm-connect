# 🌾 Farm Connect — Visual Codebase Architecture Atlas & Developer Learning System

> **Audience**: Full-Stack Engineers, Product Architects, Onboarding Developers, and Code Reviewers  
> **Repository**: `D:\farm-connect`  
> **Documentation Root**: `docs/visual-architecture/`  
> **Status**: Comprehensive, Audited, Non-Destructive Documentation Suite

Welcome to the **Farm Connect Visual Architecture Atlas and Developer Learning System**. This repository atlas provides an exhaustive, diagrammatic guide to the implementation, database models, request lifecycles, and deployment boundaries of Farm Connect.

Every diagram and guide in this atlas is verified directly against the production source files in the repository.

---

## 🗺️ Master Directory & Diagram Index

```text
docs/visual-architecture/
├── README.md                                  # Master navigation guide & documentation index (this file)
├── index.html                                 # Interactive browser-based Visual Architecture Portal (36 Diagrams)
├── verification-report.md                     # Formal audit verification report & repository evidence log
├── architecture-inventory.md                  # Comprehensive technical inventory, API routes & environment audit
│
├── 00-system-overview/                        # Global Architecture & High-Level Systems
│   ├── system-context.svg                     # Stakeholders, client devices, and external cloud boundary
│   ├── complete-architecture.svg              # End-to-end component topology (Next.js, Express, PostgreSQL)
│   └── technology-and-service-map.svg         # Package versions, network protocols, and infrastructure tiers
│
├── 01-frontend/                               # Next.js 16.2 / React 19 Client Architecture
│   ├── frontend-architecture.svg              # App Router hierarchy and 5-tier Provider cascade
│   ├── pages-and-components.svg               # Page route tree, Leaflet GIS explorer, and UI component catalog
│   ├── routing-and-navigation.svg             # Route transitions, authentication guards, and role paths
│   ├── authentication-and-state.svg           # AuthContext, CartContext, LocationContext lifecycles
│   └── api-integration.svg                    # Axios interceptor pipeline and error boundary handling
│
├── 02-backend/                                # Node.js / Express 4 Server Architecture
│   ├── backend-architecture.svg               # Middleware pipeline, controllers, and database connection pool
│   ├── server-startup-and-registration.svg    # Boot sequence from Node process invocation to port listening
│   ├── routes-and-request-handlers.svg        # REST endpoint catalog, HTTP methods, and DB query maps
│   ├── authentication-and-authorization.svg    # Fast2SMS OTP engine, otp_store table, and JWT RBAC
│   ├── api-request-lifecycle.svg              # Ingress request path through middleware, validation & output
│   └── error-handling.svg                     # Centralized error handler, 404 safety, and exception catch-alls
│
├── 03-database/                               # Supabase PostgreSQL Relational & Spatial Tier
│   ├── database-erd.svg                       # 8-Table Entity Relationship Diagram (ERD) with keys & types
│   ├── tables-and-relationships.svg           # Relational cardinality, primary/foreign keys & cascade rules
│   ├── database-query-lifecycle.svg           # pg.Pool connection acquisition, TLS 1.3 execution & idle release
│   ├── data-integrity.svg                     # ACID transaction boundaries, atomic stock guards & JSONB locking
│   └── geospatial-proximity-engine.svg        # PL/pgSQL calculate_distance_km() Haversine spatial math
│
├── 04-full-stack-flows/                       # End-to-End User Journeys & State Machines
│   ├── authentication-and-otp.svg             # Passwordless 6-digit SMS OTP dispatch, verification & JWT seed
│   ├── marketplace-and-product-discovery.svg  # GPS coordinate acquisition, radius filtering & crop rendering
│   ├── product-management.svg                 # Farmer crop listing, stock balance updates & active toggle
│   ├── cart-and-checkout.svg                  # Client cart mutations, stock bound clamping & localStorage sync
│   ├── order-lifecycle.svg                    # Order state transitions: pending → confirmed → shipped → delivered
│   ├── product-image-upload.svg               # Multer memory buffer stream to Cloudinary Media Cloud
│   ├── nearby-farmer-discovery.svg            # Verified farmer directory, spatial radius sorting & profile cards
│   ├── notifications.svg                      # In-app delivery updates, status alerts & unread badge counters
│   └── administrative-analytics.svg           # Platform GMV aggregations, user metrics & farmer verification
│
├── 05-deployment/                             # Cloud Infrastructure & Network Boundaries
│   ├── deployment-architecture.svg            # Vercel Edge CDN, Render Node container, Supabase AWS PostgreSQL
│   ├── production-request-flow.svg            # Browser HTTPS request ingress through proxy, rate limit & DB
│   └── external-service-integrations.svg      # Matrix of Fast2SMS, Cloudinary, Supabase, and OpenStreetMap
│
├── 06-code-tracing/                           # Developer Source Code Traceability & Catalogs
│   ├── frontend-source-map.svg                # Visual architectural tree of frontend/src/ App Router & components
│   ├── backend-source-map.svg                 # Dual-backend layout: Root Port 5000 vs Modular Subfolder Port 4000
│   ├── feature-to-code-index.svg              # Cross-stack matrix linking 8 features to pages, routes & SQL
│   ├── endpoint-to-implementation.svg         # Complete REST API directory with controllers, middleware & schemas
│   ├── database-entity-to-feature.svg         # Bi-directional mapping of database tables to read/write queries
│   └── feature-code-paths.md                  # Line-by-line developer traces for primary workflows
│
└── sources/                                   # Editable Mermaid Source Assets (.mmd)
    ├── README.md                              # Vector design system & palette standards
    ├── 00-system-overview.mmd                 # Mermaid sources for System Context & Architecture
    ├── 01-frontend.mmd                        # Mermaid sources for Provider Cascade & Routing
    ├── 02-backend.mmd                         # Mermaid sources for Server Startup & Middleware
    ├── 03-database.mmd                        # Mermaid sources for Relational ERD & Haversine Engine
    ├── 04-full-stack-flows.mmd                # Mermaid sources for Auth, Marketplace & Orders
    ├── 05-deployment.mmd                      # Mermaid sources for Cloud Hosting & Production Ingress
    └── 06-code-tracing.mmd                    # Mermaid sources for Source Maps & Endpoint Catalogs
```

---

## 🚀 Interactive Visual Architecture Portal (`index.html`)

An interactive, responsive single-page web portal is provided at [`docs/visual-architecture/index.html`](file:///D:/farm-connect/docs/visual-architecture/index.html).

### Key Portal Features:
1. **Interactive Sidebar Navigation**: Filter and preview all 36 standalone architecture diagrams organized into 7 numbered sections.
2. **Instant Search & Filter**: Real-time fuzzy filtering of diagrams by feature, component name, database table, or external service.
3. **Standalone Vector Viewer**: Direct links to open raw SVGs in high resolution with responsive scaling and zero pixelation on retina / 4K monitors.
4. **Direct Reference Links**: Instant access to [`architecture-inventory.md`](file:///D:/farm-connect/docs/visual-architecture/architecture-inventory.md) and [`feature-code-paths.md`](file:///D:/farm-connect/docs/visual-architecture/06-code-tracing/feature-code-paths.md).

To view the portal locally, simply open [`docs/visual-architecture/index.html`](file:///D:/farm-connect/docs/visual-architecture/index.html) in Google Chrome, Edge, Firefox, or Safari.

---

## 📚 Section Breakdown

### 00 — System Overview
Provides the executive and architectural 30,000-foot view of Farm Connect.
- **`system-context.svg`**: Identifies all user roles (Farmer, Consumer, Admin), hardware devices, and external API gateways.
- **`complete-architecture.svg`**: Illustrates how the Next.js client, Express API runtime, and Supabase PostgreSQL instance interact.
- **`technology-and-service-map.svg`**: Summarizes the precise library versions, protocols, and hosting platforms.

### 01 — Frontend Architecture
Deconstructs the Next.js 16 (App Router) + React 19 application in `frontend/src/`.
- **`frontend-architecture.svg`**: Explains the 5-tier Provider Cascade in `layout.tsx` (`ThemeProvider` → `AuthProvider` → `LocationProvider` → `ToastProvider` → `CartProvider`).
- **`pages-and-components.svg`**: Catalogs all App Router pages and reusable UI components.
- **`routing-and-navigation.svg`**: Visualizes route guards, dynamic parameters, and consumer vs farmer portals.
- **`authentication-and-state.svg`**: Documents localStorage credentials storage and state lifecycles.
- **`api-integration.svg`**: Maps Axios request and response interceptors, automatic JWT header injection, and 401 handling.

### 02 — Backend Architecture
Details the Express application runtimes.
- **`backend-architecture.svg`**: Shows the multi-tiered pipeline: Middleware → Routes → Controllers → Services → Database Pool.
- **`server-startup-and-registration.svg`**: Details the step-by-step startup sequence in `server.js` and `src/app.js`.
- **`routes-and-request-handlers.svg`**: Maps all REST endpoints to their respective controllers.
- **`authentication-and-authorization.svg`**: Documents the passwordless SMS OTP flow with Fast2SMS and 30-day JWT issuance.
- **`api-request-lifecycle.svg`**: Follows an HTTP request through trust proxy, rate limiting, authentication, and execution.
- **`error-handling.svg`**: Illustrates centralized error formatting, constraint violation handling, and crash prevention.

### 03 — Database Architecture
Analyzes the Supabase PostgreSQL database schema and queries.
- **`database-erd.svg`**: Full relational diagram with all 8 tables, data types, primary keys, and foreign keys.
- **`tables-and-relationships.svg`**: Highlights table cardinality and cascading delete rules.
- **`database-query-lifecycle.svg`**: Traces connection leasing from `pg.Pool` (max 10 connections) over TLS 1.3.
- **`data-integrity.svg`**: Illustrates transaction boundaries, stock balance checking, and JSONB order history freezing.
- **`geospatial-proximity-engine.svg`**: Explains the PL/pgSQL `calculate_distance_km()` stored function using the spherical Haversine equation ($R = 6371\text{ km}$).

### 04 — Full-Stack Feature Workflows
Traces 9 primary features end-to-end from user interaction to database commit.
- **`authentication-and-otp.svg`**: Passwordless phone registration, OTP delivery, verification, and profile seeding.
- **`marketplace-and-product-discovery.svg`**: Browser geolocation resolution, spatial filtering query, and Leaflet marker plotting.
- **`product-management.svg`**: Farmer crop catalog creation, active visibility toggling, and stock updates.
- **`cart-and-checkout.svg`**: In-browser cart manipulation, stock ceiling clamping, and local storage persistence.
- **`order-lifecycle.svg`**: Complete order status machine (`pending` → `confirmed` → `shipped` → `delivered`).
- **`product-image-upload.svg`**: Multer memory buffer ingestion and streaming to Cloudinary Media Cloud.
- **`nearby-farmer-discovery.svg`**: Verified farmer search, radius calculations, and direct contact cards.
- **`notifications.svg`**: Event-driven notification generation on order status mutations.
- **`administrative-analytics.svg`**: Platform GMV aggregation queries, user counts, and farmer verification approvals.

### 05 — Deployment Architecture
Explains cloud hosting, network topology, and external service contracts.
- **`deployment-architecture.svg`**: Depicts Vercel Edge hosting, Render Web Service container, and Supabase PostgreSQL.
- **`production-request-flow.svg`**: Maps ingress traffic from client browser through Edge DNS, TLS reverse proxy, and DB pool.
- **`external-service-integrations.svg`**: Audits third-party protocols, API key boundaries, and sandbox fallback modes.

### 06 — Code Tracing & Source Maps
Connects architectural concepts directly to source files and lines of code.
- **`frontend-source-map.svg`**: Visual breakdown of `frontend/src/` files and responsibilities.
- **`backend-source-map.svg`**: Distinguishes the Root Backend (Port 5000) from the Modular Subdirectory Backend (Port 4000).
- **`feature-to-code-index.svg`**: Matrix mapping 8 core features to frontend pages, API routes, controllers, and PostgreSQL tables.
- **`endpoint-to-implementation.svg`**: Exhaustive REST API catalog with HTTP methods, route paths, middleware, and queries.
- **`database-entity-to-feature.svg`**: Bi-directional mapping of database tables to the features that read and write them.
- **`feature-code-paths.md`**: Line-by-line developer tracing document covering 4 primary workflows.

### sources — Editable Mermaid Specifications
Contains editable `.mmd` files corresponding to all diagram categories. Teammates can copy these into any Mermaid renderer or VS Code extension to modify and maintain diagrams.

---

## 🔒 Verification & Safety Policy Compliance

1. **Strict Path Isolation**: All files created for this project reside strictly inside `docs/visual-architecture/`. No application files, package manifests, or configurations were modified.
2. **Zero Credentials Exposed**: All environment variable names (`JWT_SECRET`, `FAST2SMS_API_KEY`, `DATABASE_URL`) are referenced purely as variable identifiers without leaking secret values.
3. **No Fabrications**: All routes, functions, and table models are confirmed directly from `server.js`, `src/app.js`, `frontend/src/`, and `supabase/schema.sql`.
