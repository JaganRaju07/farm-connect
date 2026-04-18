🌾 Farm Connect - Smart Agricultural Marketplace

📋 Project Overview

Farm Connect is a hyperlocal agricultural marketplace being developed as part of the IEEE Computer Society Bangalore Chapter Student Internship 2026 (April–September). Our platform eliminates middlemen by connecting farmers directly with consumers in Karnataka cities, enabling fair pricing and transparent transactions.

🎯 Problem Statement

Indian farmers lose thirty to forty percent of their income to intermediaries in traditional supply chains. Small and marginal farmers who constitute eighty-six percent of all farmers in India lack direct market access and bargaining power. Farm Connect addresses this by providing a simple, city-level filtered marketplace where farmers can list products and consumers can purchase directly, ensuring fair prices for both parties.

👥 Team P116

IEEE IamPro 2026 Internship Program

| Name | Role | Primary Responsibility |
Jagan Raju B | Full Stack + Database Developer | PostgreSQL architecture, database design, team coordination 
Ishani Srinivas | Frontend Developer | UI/UX design, Next.js implementation, React components
Deekshitha P | Backend Developer | REST API development, Express.js architecture, authentication |

Mentor: Manas Ajaykumar Choksi  
Institution: The National Institute of Engineering (NIE), Mysuru  
Affiliation: VTU Belagavi | IEEE Computer Society - NIE Student Branch

🏗️ Technical Architecture

Farm Connect follows a modern three-tier architecture optimized for scalability and maintainability.

Technology Stack

Frontend Layer
- Next.js 14 with App Router for server-side rendering and optimal performance
- TypeScript for type safety and better developer experience
- Tailwind CSS for responsive, utility-first styling
- Leaf UI component library for consistent design system

Backend Layer
- Node.js v20 runtime environment
- Express.js framework for RESTful API development
- JWT-based authentication with role-based access control
- Fast2SMS integration for phone OTP verification

Database Layer
- PostgreSQL 15 for relational data management
- Normalized schema design (3NF) with proper foreign key constraints
- Transaction support for atomic operations (critical for stock management)
- Connection pooling for optimized performance

Deployment & DevOps
- Docker containerization for consistent development environments
- Railway for production database and backend hosting
- Vercel for frontend deployment with automatic HTTPS
- GitHub for version control and team collaboration

📦 Repository Structure

The repository is organized into three main modules, each owned by a specific team member while maintaining clear integration points.
farm-connect/
├── frontend/              # Next.js 14 app (Ishani's ownership)
│   ├── app/               # App Router pages and layouts
│   ├── components/        # Reusable UI components
│   └── public/            # Static assets
│
├── backend/               # Express.js REST API (Deekshitha's ownership)
│   ├── src/
│   │   ├── config/        # database.js, env validation
│   │   ├── routes/        # Express route handlers
│   │   ├── services/      # Business logic + DB queries
│   │   └── middleware/    # Auth, error handling
│   └── package.json
│
├── database/              # PostgreSQL schema and seeds (Jagan's ownership)
│   ├── schema.sql         # All CREATE TABLE statements + indexes + triggers
│   └── seed.sql           # Sample data for local development
│
├── docs/                  # Shared documentation
│   ├── DATABASE_DESIGN.md # ER diagram and design decisions
│   ├── DATABASE_SETUP.md  # Step-by-step setup guide for all team members
│   ├── INTEGRATION_GUIDE.md # How frontend, backend, and DB connect
│   └── QUALITY_CHECKLIST.md # Pre-merge checklist
│
├── docker-compose.yml     # One-command local PostgreSQL + pgAdmin setup
├── .gitignore
└── README.md

🚀 Quick Start (Local Development)

Prerequisites

- Node.js 18+ and npm
- Docker Desktop (recommended) **OR** PostgreSQL 15 installed locally
- Git

Step 1 — Clone the repository

```bash
git clone https://github.com/your-org/farm-connect.git
cd farm-connect

Step 2 — Start the database

```bash
# Using Docker (recommended — no PostgreSQL installation needed)
docker-compose up -d

# Verify the database is running
docker-compose ps
```

pgAdmin is available at http://localhost:5050 (email: `admin@farmconnect.dev`, password: `admin123`).

Step 3 — Configure environment variables

```bash
# In the /backend directory, create a .env file
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgres://farmconnect_user:farmconnect_pass@localhost:5432/farmconnect
NODE_ENV=development
PORT=4000
JWT_SECRET=your_jwt_secret_here
```

Step 4 — Start the backend

```bash
cd backend
npm install
npm run dev
# API is now running at http://localhost:4000
```

Step 5 — Start the frontend

```bash
cd frontend
npm install
npm run dev
# App is now running at http://localhost:3000
```

---

Database Schema (Quick Reference)

The database has 7 tables:

| Table       | Purpose                                      
| `farmers`   | Farmer accounts + verification status        
| `consumers` | Consumer accounts                            
| `products`  | Product listings (linked to farmer + city)  
| `orders`    | Orders linking consumers ↔ farmers           
| `payments`  | Payment records (COD-first, online-ready)    
| `admins`    | Internal admin users                         
| `otp_store` | Temporary OTP codes (expire in 5 minutes)    

See `docs/DATABASE_DESIGN.md` for the full ER diagram and design rationale.

📋 Week-by-Week Progress

| Week | Milestone | Status 
| 1    | Database schema, seed data, GitHub setup, Docker config | ✅ Complete 
| 2    | OTP auth API, product listing API, city filtering | 🔄 In Progress 
| 3    | Order placement, stock management, farmer dashboard | ⬜ Upcoming 
| 4    | Admin verification workflow, concurrent order stress test | ⬜ Upcoming 
| 5–9  | Frontend integration, deployment, testing, final report | ⬜ Upcoming 

🌐 Deployment (Railway)

Farm Connect deploys on [Railway](https://railway.app):

- Backend service — auto-deploys from the `/backend` folder on push to `main`.
- PostgreSQL service — managed by Railway, `DATABASE_URL` is injected automatically.
- Frontend — deployed on Vercel, consumes the Railway backend API.

See `docs/DATABASE_SETUP.md` for Railway-specific setup steps.

🤝 Contributing (Team Workflow)

1. Always branch off `main`: `git checkout -b feature/your-feature-name`
2. Never push `.env` files — they are in `.gitignore`.
3. Test your changes against the Docker database before opening a PR.
4. Tag Jagan on any PR that touches `database/schema.sql` — schema changes need a migration, not a DROP + recreate.
5. Use meaningful commit messages: `feat: add OTP expiry cleanup endpoint`.
