# 🌱 Farm Connect   
> Hyperlocal agricultural marketplace connecting farmers directly with consumers within 5–10km using GPS-based discovery.

**Team P116 | IEEE Computer Society Bangalore Chapter Student Internship 2026**
---
## 🌐 Live Demo
| Service | URL |
|---------|-----|
| Frontend | https://farm-connect.vercel.app |
| Backend API | https://farm-connect-backend.up.railway.app |
| API Health | https://farm-connect-backend.up.railway.app/health |
---
## 🔑 Demo Credentials
| Role | Phone | OTP (dev) |
|------|-------|-----------|
| Consumer | 9900000001 | Check server console |
| Farmer | 9845000001 | Check server console |
| Admin | admin@farmconnect.in / FarmConnect@2026 | — |
---
## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | **Supabase** (PostgreSQL 15) with IPv4 Connection Pooling (Supavisor) |
| Images | Cloudinary CDN |
| OTP SMS | Fast2SMS |
| Deployment | Railway (Backend API), Vercel (Frontend UI) |
---
## 🚀 Local Setup

### Step 1 — Clone and setup
```bash
git clone https://github.com/JaganRaju07/farm-connect.git
cd farm-connect
git checkout develop
```

### Step 2 — Backend & Database Configuration
We use **Supabase** for our cloud database. No local Docker installation is required!
```bash
cd backend
cp .env.example .env
# Fill in your Supabase Pooler DATABASE_URL (Port 6543)
# Fill in your Cloudinary and Fast2SMS keys in .env
npm install
npm run dev
# Running at http://localhost:4000
```

### Step 3 — Frontend Configuration (Pending)
```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your Railway URL or localhost:4000
npm install
npm run dev
# Running at http://localhost:3000
```
---
## ✨ Key Features Implemented (Weeks 1-7)

- 📍 **GPS-Based Discovery** — Haversine formula finds farmers within 5–10km radius.
- 🛍️ **Complete Order Lifecycle** — pending → confirmed → packed → delivered → paid.
- 📱 **OTP Authentication** — Secure phone-based login, eliminating passwords.
- 🖼️ **Product Image Upload** — Cloudinary CDN with auto WebP conversion.
- 🛡️ **Admin Verification Dashboard** — Admin endpoints to securely approve/reject farmer applications.
- ⭐ **Verified Product Reviews** — Consumers can rate products (1-5 stars) strictly post-purchase. Handled via PostgreSQL constraints to prevent duplicates.
- 🔔 **Low Stock Alerts** — Automated notifications to farmers when crop inventory falls below thresholds.
- ❤️ **Consumer Wishlist** — Seamless heart-toggle saving mechanism for favorite crops.
- 📊 **Platform Analytics** — Aggregated GMV, user growth, and active order metrics for the Admin Dashboard.

## 🔐 Enterprise-Grade Security
- **XSS Protection** — Global Request Sanitizer middleware actively scrubs all incoming HTML/JS payloads.
- **Strict Role Auth** — Bulletproof JWT Middleware (`roleAuth.js`) segregates Farmer, Consumer, and Admin routes.
- **Rate Limiting** — OTP endpoint limited to 5 requests per 10 minutes to prevent SMS abuse.
- **Transaction Safety** — `SELECT FOR UPDATE` implemented to prevent stock overselling during concurrent checkout requests.
- **Dynamic CORS** — Secures API endpoints from unauthorized cross-origin requests.

---
## 👥 Team
| Name | Role |
|------|------|
| Jagan Raju B | Team Lead + Database + Full Stack |
| Deekshitha P | Backend Developer |
| Ishani Srinivas | Frontend Developer |

**Mentor:** Dr. Narender M.
**Institute:** The National Institute of Engineering, Mysuru (VTU Belagavi)
