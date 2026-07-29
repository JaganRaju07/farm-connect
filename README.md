# Farm Connect   
> Hyperlocal agricultural marketplace connecting farmers directly with consumers
> within 5–10km using GPS-based discovery.
**Team P116 | IEEE Computer Society Bangalore Chapter Student Internship 2026**
---
## Live Demo
| Service | URL |
|---------|-----|
| Frontend | https://farm-connect.vercel.app |
| Backend API | https://farm-connect-backend.up.railway.app |
| API Health | https://farm-connect-backend.up.railway.app/health |
---
## Demo Credentials
| Role | Phone | OTP (dev) |
|------|-------|-----------|
| Consumer | 9900000001 | Check server console |
| Farmer | 9845000001 | Check server console |
| Admin | admin@farmconnect.in / FarmConnect@2026 | — |
---
## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 15 |
| Images | Cloudinary CDN |
| OTP SMS | Fast2SMS |
| Deployment | Railway (backend + DB), Vercel (frontend) |
---
## Local Setup
### Prerequisites
- Docker Desktop installed and running
- Node.js v20
### Step 1 — Clone and setup
```bash
git clone https://github.com/JaganRaju07/farm-connect.git
cd farm-connect
git checkout develop
```
### Step 2 — Start database
```bash
docker-compose up -d
# Wait 10 seconds for PostgreSQL to start
```
### Step 3 — Setup database schema
```bash
psql -U farmconnect_user -d farmconnect -f database/production_migration.sql
psql -U farmconnect_user -d farmconnect -f database/seed_final_demo.sql
```
### Step 4 — Backend
```bash
cd backend
cp .env.example .env
# Fill in your Cloudinary and Fast2SMS keys in .env
npm install
npm run dev
# Running at http://localhost:5000
```
### Step 5 — Frontend
```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm install
npm run dev
# Running at http://localhost:3000
```
---
## Key Features
- **GPS-Based Discovery** — Haversine formula finds farmers within 5–10km radius
- **Complete Order Lifecycle** — pending → confirmed → packed → delivered → paid
- **OTP Authentication** — Phone-based login, no passwords
- **Product Image Upload** — Cloudinary CDN with auto WebP conversion
- **Admin Verification** — Approve/reject farmer applications
- **Product Reviews** — Verified purchase reviews with auto rating calculation
- **Low Stock Alerts** — PostgreSQL trigger notifies farmer automatically
- **Consumer Wishlist** — Save products for later
- **Rate Limiting** — OTP endpoint limited to 5 requests per 10 minutes
- **Transaction Safety** — SELECT FOR UPDATE prevents stock overselling
---
## Team
| Name | Role |
|------|------|
| Jagan Raju B | Team Lead + Database + Full Stack |
| Deekshitha P | Backend Developer |
| Ishani Srinivas | Frontend Developer |
**Mentor:** Dr. Narender M.
**Institute:** The National Institute of Engineering, Mysuru (VTU Belagavi)
