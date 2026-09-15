# Farm Connect

Farm Connect is a direct-to-consumer agricultural marketplace connecting farmers with local buyers. By eliminating middlemen, farmers earn more for their produce while consumers enjoy fresher food at better prices.

## Links

- **Backend (API)**: [Railway Production URL](https://farm-connect-production.up.railway.app)
- **Frontend (Web)**: [Vercel Deployment] (Deployment pending)

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Lucide React Icons
- Framer Motion

### Backend
- Node.js
- Express.js
- PostgreSQL
- Supabase (Database Hosting)
- JSON Web Tokens (JWT)
- Cloudinary (Image Uploads)
- Multer

## Local Setup

### 1. Database
You will need a PostgreSQL database. You can set one up locally or use Supabase.
Run the SQL setup scripts in `backend/database.sql` to initialize the tables.

### 2. Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=4000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
Run the frontend:
```bash
npm run dev
```

## Team
Team P116 | IEEE CS Bangalore Chapter Internship 2026
Jagan Raju B — Team Lead
