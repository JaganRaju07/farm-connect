# Farm Connect

**Direct Farmer-to-Consumer Agricultural Marketplace**

A full-stack software engineering project that connects local farmers directly with nearby consumers through geographic proximity discovery, secure authentication, and real-time inventory management.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Express.js](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

[Live Demo](#-live-demo) • [Quick Start](#-getting-started) • [Architecture](#-architecture) • [API](#-api-overview)

</div>

---

## 🎯 Live Demo

**Frontend:** [https://farm-connect-eta-ten.vercel.app](https://farm-connect-eta-ten.vercel.app)

> **Note:** The backend is hosted on Render's free tier and may take 45–60 seconds to respond after inactivity (cold start). Please allow extra time for the initial API call.

---

## 📝 Overview

Farm Connect is a marketplace that eliminates supply-chain intermediaries by enabling farmers to list produce directly to nearby consumers. Consumers discover products based on **actual geographic proximity** using the Haversine distance formula computed in PostgreSQL.

### The Problem

Traditional agricultural supply chains introduce intermediary costs and delays:
- Farmers receive minimal profit from their produce
- Consumers pay inflated prices
- Fresh produce loses freshness over long distances
- Delivery requires complex logistics coordination

### The Solution

**Hyperlocal marketplace design:**
- Farmers digitize inventory with real-time stock validation
- Consumers discover products and nearby farms within a configurable radius
- Orders go directly from consumer to farmer
- Delivery is coordinated locally
- Payment is collected on delivery (COD)

---

## ✨ Key Features

### For Consumers
- ✅ **Passwordless Login** — OTP-based phone authentication
- ✅ **Marketplace Discovery** — Browse nearby products and farms
- ✅ **Proximity Search** — Filter by distance using Haversine algorithm
- ✅ **Product Details** — View farmer info, organic status, harvest date, and stock
- ✅ **Interactive Map** — Visualize farm locations and product distance
- ✅ **Shopping Cart** — Add items with real-time stock validation
- ✅ **Order Placement** — Secure checkout with automatic delivery fee calculation
- ✅ **Order Tracking** — Track order status from pending through delivery
- ✅ **Wishlist** — Save products for later
- ✅ **Reviews & Ratings** — Rate products and provide feedback
- ✅ **Notifications** — Receive updates on order status

### For Farmers
- ✅ **Farmer Dashboard** — Overview of sales, orders, and analytics
- ✅ **Product Management** — Create, update, and manage inventory
- ✅ **Image Uploads** — Upload product photos to Cloudinary
- ✅ **Stock Management** — Real-time inventory tracking with low-stock alerts
- ✅ **Order Management** — Receive and process consumer orders
- ✅ **Order Lifecycle** — Update order status through delivery pipeline
- ✅ **Location Profile** — GPS coordinates for proximity discovery

### For Administrators
- ✅ **Admin Dashboard** — Platform analytics and management console
- ✅ **Farmer Verification** — Review and approve/reject farmer applications
- ✅ **Platform Analytics** — Monitor user growth, transactions, and metrics
- ⚠️ **User Moderation** — Administrative controls (partial implementation)

---

## 🌍 Hyper-Local Discovery Technology

Farm Connect uses the **Haversine distance formula** to calculate straight-line geographic distance on Earth's surface:

```sql
SELECT calculate_distance_km(
  consumer_latitude,   -- 12.9716 (Jayanagar, Bengaluru)
  consumer_longitude,  -- 77.5946
  farm_latitude,       -- 12.7900 (Kanakapura Road)
  farm_longitude       -- 77.4700
) AS distance_km
-- Result: ≈24.78 km
```

**Important:** This is **straight-line distance**, not road-based routing. It represents the direct geographic distance between consumer and farmer. Future enhancements may include road-distance calculations and ETA prediction.

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Frontend
        Client["Browser / App"]
        NextJS["Next.js 16 Frontend"]
    end
    
    subgraph Backend
        API["Express.js API"]
        Auth["JWT / RBAC Middleware"]
        Validation["Input Validation & Sanitization"]
    end
    
    subgraph Data
        PG["PostgreSQL"]
        Cache["Haversine Function"]
    end
    
    subgraph Services
        Cloudinary["Cloudinary CDN"]
    end
    
    subgraph Deployment
        Vercel["Vercel"]
        Render["Render"]
        Supabase["Supabase"]
    end
    
    Client <--> NextJS
    NextJS <--> API
    API <--> Auth
    API <--> Validation
    Auth --> API
    API <--> PG
    PG <--> Cache
    API <--> Cloudinary
    NextJS --> Vercel
    API --> Render
    PG --> Supabase
```

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js | 16.2.4 | App shell, routing, SSR |
| **UI Library** | React | 19.2.4 | Component-based UI |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.4.4 | Utility-first CSS |
| **Mapping** | React Leaflet | 5.0 | Interactive maps |
| **HTTP Client** | Axios | 1.15 | API requests with interceptors |
| **Backend Runtime** | Node.js | 18+ | Server runtime |
| **Web Framework** | Express.js | 4.19 | REST API server |
| **Database** | PostgreSQL | 14+ | Relational data + Haversine |
| **Database Driver** | pg | 8.11 | Node.js PostgreSQL client |
| **Authentication** | JWT | — | Stateless session tokens |
| **File Upload** | Multer | 1.4.5 | File parsing middleware |
| **Image Storage** | Cloudinary | — | CDN for product images |
| **Security** | Helmet | 7.1 | HTTP security headers |
| **Rate Limiting** | express-rate-limit | 7.2 | API abuse prevention |
| **Input Validation** | express-validator | 7.3.2 | Request validation |
| **Deployment** | Vercel | — | Frontend hosting |
| **Deployment** | Render | — | Backend hosting |
| **Database Host** | Supabase | — | PostgreSQL as a service |

---

## 📦 Repository Structure

```
farm-connect/
├── frontend/                           # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/                        # App Router pages & layouts
│   │   ├── components/                 # Reusable React components
│   │   ├── context/                    # Context API (cart, auth)
│   │   ├── hooks/                      # Custom hooks (geolocation)
│   │   ├── lib/                        # Utilities, Axios config
│   │   └── types/                      # TypeScript interfaces
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                            # Express.js Backend
│   ├── src/
│   │   ├── app.js                      # Express entry point
│   │   ├── config/                     # Database config
│   │   ├── controllers/                # Request handlers
│   │   ├── middleware/                 # Auth, RBAC, sanitization
│   │   ├── routes/                     # API route definitions
│   │   └── services/                   # Business logic & queries
│   ├── package.json
│   ├── Procfile                        # Render deployment config
│   └── .env.example
│
├── database/                           # PostgreSQL Schema
│   ├── schema.sql                      # Core tables & functions
│   ├── seed.sql                        # Sample data
│   └── production_migration.sql        # Production updates
│
├── package.json                        # Root monorepo config
├── README.md                           # This file
└── .env.example                        # Environment template
```

---

## 🔐 Authentication & Security

### Authentication Flow

1. **OTP Login** (Consumers & Farmers)
   - User enters phone number
   - SMS OTP is sent and stored with 5-minute expiry
   - User enters OTP
   - Backend verifies and issues JWT token
   - Frontend stores JWT in `localStorage`

2. **Token Management**
   - JWT is attached to all authenticated requests via Axios interceptor
   - Token expires according to `JWT_EXPIRES_IN` environment variable
   - Expired/invalid tokens trigger automatic logout

3. **Admin Authentication**
   - Email + password login (bcrypt password hashing)
   - Separate JWT issuance for admin sessions
   - [Status: TO BE CONFIRMED in active code]

### RBAC (Role-Based Access Control)

Middleware enforces roles on protected routes:

```javascript
// Example: Only farmers can access this route
router.use(authenticateToken);    // Must be logged in
router.use(requireRole('farmer')); // Must be a farmer
```

Valid roles:
- `consumer` — end-user marketplace access
- `farmer` — farm management access
- `admin` — platform administration

### Security Mechanisms

| Feature | Implementation |
|---------|---|
| **HTTP Headers** | Helmet.js |
| **CORS** | Explicit origin whitelist from env var |
| **Rate Limiting** | 300 req/15min per IP via express-rate-limit |
| **Input Sanitization** | XSS prevention via custom sanitizer middleware |
| **Input Validation** | express-validator on all endpoints |
| **SQL Injection** | Parameterized queries via pg driver |
| **Stock Validation** | Database transaction with SELECT...FOR UPDATE |
| **Proxy Trust** | trust proxy = 1 for Render load balancer |
| **File Uploads** | File type & size restrictions via Multer |

### Known Security Considerations

- **JWT in localStorage:** Vulnerable to XSS. Production deployments should migrate to HTTP-only secure cookies.
- **Demo OTP Routes:** Development-only OTP retrieval endpoints should not exist in production.
- **Schema Merge Markers:** The `database/schema.sql` file contains unresolved Git merge markers and must be resolved before deployment.

---

## 📡 API Overview

### Authentication
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/send-otp` | No | Send OTP via SMS |
| POST | `/api/v1/auth/verify-otp` | No | Verify OTP, return JWT |
| POST | `/api/v1/auth/complete-registration` | Yes | Complete user profile after OTP signup |
| GET | `/api/v1/auth/me` | Yes | Fetch authenticated user info |

### Products
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/products` | No | List products (supports filtering, search, location) |
| GET | `/api/v1/products/:id` | No | Get product details |
| POST | `/api/v1/products` | Yes (Farmer) | Create product |
| PUT | `/api/v1/products/:id` | Yes (Farmer) | Update product |
| DELETE | `/api/v1/products/:id` | Yes (Farmer) | Delete product |

### Farmers
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/farmers/nearby` | Yes (Consumer) | Find farmers within radius |
| GET | `/api/v1/farmers/dashboard` | Yes (Farmer) | Farmer dashboard metrics |
| GET | `/api/v1/farmers/orders` | Yes (Farmer) | List incoming orders |
| PUT | `/api/v1/farmers/orders/:id/status` | Yes (Farmer) | Update order status |

### Orders
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/orders/place` | Yes (Consumer) | Place order with validation |
| GET | `/api/v1/orders` | Yes | List user's orders |
| GET | `/api/v1/orders/:id` | Yes | Get order details |

### Additional Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/reviews` | No | List reviews (by product/farmer) |
| POST | `/api/v1/reviews` | Yes (Consumer) | Create product review |
| GET | `/api/v1/wishlist` | Yes (Consumer) | Get consumer's wishlist |
| POST | `/api/v1/wishlist` | Yes (Consumer) | Add product to wishlist |
| DELETE | `/api/v1/wishlist/:id` | Yes (Consumer) | Remove from wishlist |
| GET | `/api/v1/notifications` | Yes | Get user notifications |
| POST | `/api/v1/upload` | Yes (Farmer) | Upload image to Cloudinary |
| GET | `/api/v1/admin/analytics` | Yes (Admin) | Platform analytics |
| GET | `/api/v1/admin/verifications/pending` | Yes (Admin) | Pending farmer approvals |
| POST | `/api/v1/admin/verifications/:farmerId/approve` | Yes (Admin) | Approve farmer |
| POST | `/api/v1/admin/verifications/:farmerId/reject` | Yes (Admin) | Reject farmer application |
| GET | `/health` | No | Server health check |
| GET | `/api/health` | No | API health check |

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| **farmers** | Farm profiles | id, name, phone, email, latitude, longitude, address, city, verification_status, is_active |
| **consumers** | Consumer profiles | id, name, phone, email, latitude, longitude, delivery_address, city, is_active |
| **products** | Product listings | id, farmer_id, name, category, price, stock_available, image_url, is_organic, harvest_date |
| **orders** | Order records | id, order_number, consumer_id, farmer_id, items (JSONB), order_status, payment_status, delivery_distance_km |
| **admins** | Admin accounts | id, name, email, password_hash, role, is_active |
| **otp_store** | Temporary OTP codes | phone (PK), otp_code, expires_at, user_type, action |

### Key Functions & Triggers

```sql
-- Haversine distance calculation
calculate_distance_km(lat1, lon1, lat2, lon2) → DECIMAL

-- Auto-update timestamps
update_updated_at_column() → used by farmers, consumers, products tables
```

### ER Diagram

```mermaid
erDiagram
    FARMERS ||--o{ PRODUCTS : owns
    FARMERS ||--o{ ORDERS : fulfills
    CONSUMERS ||--o{ ORDERS : places
    ORDERS ||--|| OTP_STORE : verified_via
    ADMINS ||--o{ FARMERS : verifies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ or Supabase account
- **Git**
- Cloudinary account (for image uploads)

### Clone Repository

```bash
git clone https://github.com/JaganRaju07/farm-connect.git
cd farm-connect
```

### Environment Variables

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/farm_connect
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ALLOWED_ORIGINS=http://localhost:3000,https://farm-connect-eta-ten.vercel.app
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Database Setup

1. **Create database:**
   ```bash
   createdb farm_connect
   ```

2. **Initialize schema:**
   ```bash
   psql farm_connect < database/schema.sql
   ```

3. **Seed sample data (optional):**
   ```bash
   psql farm_connect < database/seed.sql
   ```

> **Note:** `database/schema.sql` contains unresolved Git merge markers. Resolve these before running in production.

### Start Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd frontend
vercel deploy --prod
```

Vercel automatically:
- Builds Next.js app
- Optimizes images via Image Optimization API
- Deploys to global edge network

### Backend → Render

```bash
# Connect Render to GitHub repo
# Render automatically detects backend/Procfile
# Deploys on git push
```

Set environment variables in Render dashboard.

### Database → Supabase

1. Create Supabase project
2. Run `database/schema.sql` in SQL Editor
3. Copy `DATABASE_URL` and `SUPABASE_*` credentials
4. Set in Render environment variables

### Images → Cloudinary

1. Create Cloudinary account
2. Get credentials from Dashboard
3. Set `CLOUDINARY_*` env vars in Render

---

## 📊 Production Status

The current main branch includes end-to-end functionality across the full user journey:

| Component | Status |
|---|---|
| Consumer OTP Authentication | ✅ Verified |
| Farmer OTP Authentication | ✅ Verified |
| Marketplace with Filtering | ✅ Verified |
| Product Search & Discovery | ✅ Verified |
| Nearby Farmer/Product Discovery (Haversine) | ✅ Verified |
| Interactive Map | ✅ Verified |
| Product Details | ✅ Verified |
| Image Uploads to Cloudinary | ✅ Verified |
| Shopping Cart | ✅ Verified |
| Stock Validation & Atomic Orders | ✅ Verified |
| Order Placement (COD) | ✅ Verified |
| Order Status Tracking | ✅ Verified |
| Farmer Dashboard | ✅ Verified |
| Order Management | ✅ Verified |
| Admin Dashboard Shell | ✅ Verified |
| Farmer Verification Workflow | ✅ Verified |
| Platform Analytics | ✅ Verified |
| Reviews & Ratings | ✅ Verified |
| Wishlist | ✅ Verified |
| Notifications System | ✅ Verified |
| Frontend Deployment (Vercel) | ✅ Verified |
| Backend Deployment (Render) | ✅ Verified |

---

## 🎯 Known Limitations

- **Payment:** Only Cash-on-Delivery (COD) is implemented. Digital payment gateways (Stripe, Razorpay, UPI) are not yet integrated.
- **Distance Calculation:** Haversine computes straight-line distance, not road-based routing. Future enhancements may include actual navigation distance and ETA prediction.
- **Notifications:** HTTP polling every 30 seconds. WebSocket or Server-Sent Events (SSE) not implemented.
- **Admin Authentication:** Email/password login flow is [TO BE CONFIRMED] in active backend code.
- **Accessibility:** Partial accessibility implementation. aria-live regions and keyboard navigation need enhancement.
- **Mobile:** Responsive design present, but no native mobile app (React Native).

---

## 🔮 Roadmap

- **Payment Gateway Integration** — Stripe/Razorpay/UPI support for digital payments
- **Real-Time Notifications** — WebSocket-based push instead of polling
- **Road-Based Routing** — Actual delivery distance using Google Maps API
- **Delivery Tracking** — Real-time GPS tracking for in-transit orders
- **Driver Management** — Support for dedicated delivery partners
- **PWA & Offline Support** — Progressive Web App capabilities
- **Multi-Language Support** — Regional language interfaces (Kannada, Tamil, Telugu, etc.)
- **Advanced Analytics** — Farmer revenue insights, seasonal trends
- **AI-Powered Recommendations** — Suggest products based on purchase history
- **Native Mobile Apps** — React Native for iOS/Android

---

## 👥 Team

| Member | Role | Responsibility |
|--------|------|---|
| **Jagan Raju B** | Full Stack + Database Lead | Architecture, database design, backend services, deployment |
| **Deekshitha P** | Backend Developer | API routes, controllers, integrations |
| **Ishani Srinivas** | Frontend Developer | UI/UX, Next.js pages, components, state management |

**Mentor:** Dr. Narender M.

**Acknowledgements:** IEEE Computer Society Bangalore Chapter, IAMPro Internship 2026, Team P116

---

## 📝 Contributing

Farm Connect is an academic/internship capstone project. Contributions welcome for bug fixes and improvements.

### Guidelines
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: description"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request with clear description

### Development Standards
- Use meaningful commit messages
- Follow existing code style
- Test changes locally before pushing
- Do not commit secrets or credentials
- Update documentation as needed

---

## 📄 License

**Status:** [TO BE CONFIRMED]

This project was developed as an academic capstone. See LICENSE file (if present) for details.

---

## 🤝 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check existing documentation in `/docs` (if present)
- Review API examples in repository

---

<div align="center">

**Farm Connect** — Bridging the gap between farms and tables.

Built with ❤️ by Team P116 | IEEE Computer Society & IAMPro 2026

</div>
