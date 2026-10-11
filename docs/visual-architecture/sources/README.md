# 🌾 Visual Architecture Diagram Sources & Specifications

> **Documentation Root**: `docs/visual-architecture/`  
> **Source Asset Directory**: `docs/visual-architecture/sources/`  

---

## 🎨 Vector Specification & Styling Standards

All architecture diagrams in this documentation suite are authored in **native, standalone SVG 1.1** format. They are rendered directly by any modern web browser, markdown viewer, or vector editing software (e.g., Figma, Inkscape, Illustrator) without requiring intermediate rasterization or external rendering toolchains.

### Palette & Design System
- **Canvas Background**: Deep Slate (`#0b1120` / `#090d16`)
- **Container / Swimlane**: Dark Midnight (`#111827` / `#131c2e`)
- **Card Fill**: Slate 800 (`#1e293b`)
- **Borders & Dividers**: Slate 700 (`#334155` / `#1f2937`)
- **Brand Accents**:
  - Emerald Green (`#10b981` / `#34d399`): Cultivator models, success states, verified checks, DB pools
  - Sky Blue (`#38bdf8` / `#0ea5e9`): Consumer interfaces, API gateways, network routes
  - Amber Gold (`#f59e0b` / `#fbbf24`): Auth flows, external services, transactions, guards
  - Purple (`#8b5cf6` / `#c084fc`): Database tables, relational keys, schema models
  - Rose Red (`#ef4444` / `#f87171`): Error boundaries, rate limiting, exception catch-alls

### Typography Rules
- **Display Headings**: System Font Stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with font weights `700` and `800`.
- **Code & File Labels**: Monospace Font Stack (`JetBrains Mono, monospace, monospace`) with font weight `600`.
- **Responsive ViewBox**: Every SVG specifies a defined `viewBox="0 0 W H"` with `width="100%" height="100%"` to ensure crisp vector scaling across 4K displays and mobile screens.

---

## 📂 Complete Diagram Inventory Reference (36 SVGs)

| Category | Filename | Scope & Focus |
| :--- | :--- | :--- |
| **00-system-overview/** | `system-context.svg` | User roles, device endpoints, and boundary systems |
| | `complete-architecture.svg` | End-to-end full-stack component interaction map |
| | `technology-and-service-map.svg` | Package versions, protocols, and hosting tiers |
| **01-frontend/** | `frontend-architecture.svg` | App Router hierarchy and layout Provider Cascade |
| | `pages-and-components.svg` | Page views, GIS explorer, and UI component library |
| | `routing-and-navigation.svg` | Route transitions, role guards, and navigation paths |
| | `authentication-and-state.svg` | AuthContext, CartContext, and LocationContext lifecycles |
| | `api-integration.svg` | Axios interceptor pipeline and error boundaries |
| **02-backend/** | `backend-architecture.svg` | Middleware pipeline, controllers, and database pool |
| | `server-startup-and-registration.svg` | Step-by-step startup sequence to port listening |
| | `routes-and-request-handlers.svg` | REST endpoint catalog, HTTP methods, and DB queries |
| | `authentication-and-authorization.svg` | Passwordless SMS OTP engine & JWT lifecycle |
| | `api-request-lifecycle.svg` | Ingestion, route dispatch, DB query, and JSON output |
| | `error-handling.svg` | Exception boundaries, 404 handlers, and crash safety |
| **03-database/** | `database-erd.svg` | 8-table PostgreSQL entity-relationship schema with data types |
| | `tables-and-relationships.svg` | Explicit relational foreign keys and cascading behavior |
| | `database-query-lifecycle.svg` | Connection pool leasing, TLS 1.3 execution, and idle release |
| | `data-integrity.svg` | ACID transactions, inventory decrements, and JSONB price freezing |
| | `geospatial-proximity-engine.svg` | Haversine formula calculation & radius queries |
| **04-full-stack-flows/** | `authentication-and-otp.svg` | SMS OTP dispatch, verification, and token storage |
| | `marketplace-and-product-discovery.svg` | GPS capture, distance query, and cart persistence |
| | `product-management.svg` | Farmer crop catalog, stock updates, and active visibility |
| | `cart-and-checkout.svg` | Local cart mutations and stock boundary clamping |
| | `order-lifecycle.svg` | Order state transitions (pending → confirmed → shipped → delivered) |
| | `product-image-upload.svg` | Multer memory buffer ingestion and Cloudinary stream |
| | `nearby-farmer-discovery.svg` | Verified cultivator discovery and radius expansion |
| | `notifications.svg` | In-app order status updates and alert banners |
| | `administrative-analytics.svg` | Platform GMV aggregation and farmer verification |
| **05-deployment/** | `deployment-architecture.svg` | Vercel Edge, Render Node container, and Supabase DB |
| | `production-request-flow.svg` | Ingress traffic traversal through CDN, reverse proxy, and DB |
| | `external-service-integrations.svg` | Matrix of Fast2SMS, Cloudinary, Supabase, and Leaflet |
| **06-code-tracing/** | `frontend-source-map.svg` | Visual tree of frontend/src/ App Router pages & components |
| | `backend-source-map.svg` | Dual backend anatomy: Port 5000 root vs Port 4000 modular subfolder |
| | `feature-to-code-index.svg` | Cross-stack matrix linking 8 features to pages, routes & SQL |
| | `endpoint-to-implementation.svg` | Complete REST API directory with controllers and middleware |
| | `database-entity-to-feature.svg` | Bi-directional mapping of database tables to read/write queries |

---

## 🛠️ Editable Mermaid Source Files (`sources/*.mmd`)

Corresponding `.mmd` files are stored in this directory for developer maintenance:
- `00-system-overview.mmd`
- `01-frontend.mmd`
- `02-backend.mmd`
- `03-database.mmd`
- `04-full-stack-flows.mmd`
- `05-deployment.mmd`
- `06-code-tracing.mmd`
