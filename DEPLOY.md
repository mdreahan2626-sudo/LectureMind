# Deploying LectureMind AI Study Suite

This guide explains how to deploy the full-stack React + Express + Prisma (Supabase PostgreSQL) application to production.

---

## 1. Database Configuration (Supabase)
Your database is hosted on Supabase and is ready for production. 
Make sure your backend environment uses these exact credentials:
- **Transaction Pooler URL** (`DATABASE_URL`):
  `postgresql://postgres.bwrisnbwmskndrvtefmd:6Uy26EBqLc1yctto@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Direct Connection URL** (`DIRECT_URL`):
  `postgresql://postgres.bwrisnbwmskndrvtefmd:6Uy26EBqLc1yctto@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`

---

## 2. Backend Deployment (Render / Railway / Heroku)
Deploy the `backend-node/` directory to a cloud provider like **Render** or **Railway**.

### Render Deployment Steps:
1. Create a new **Web Service** on Render and link your GitHub repository.
2. Set the **Root Directory** to `backend-node`.
3. Set the **Build Command** to:
   ```bash
   npm install && npx prisma generate
   ```
4. Set the **Start Command** to:
   ```bash
   node server.js
   ```
5. Add the following **Environment Variables** in Render's dashboard:
   - `DATABASE_URL`: `postgresql://postgres.bwrisnbwmskndrvtefmd:6Uy26EBqLc1yctto@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - `DIRECT_URL`: `postgresql://postgres.bwrisnbwmskndrvtefmd:6Uy26EBqLc1yctto@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`
   - `JWT_SECRET`: (e.g. `super-secret-lecturemind-jwt-key-2026`)
   - `GEMINI_API_KEY`: (Your Google Gemini API Key from Google AI Studio)
   - `SMTP_USER` and `SMTP_PASS`: (Optional, App password for forgotten password emails)

Once built, Render will generate a live URL (e.g., `https://edu-assistant-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel / Netlify)
Deploy the `frontend/` directory to a static hosting platform like **Vercel** or **Netlify**.

### Vercel Deployment Steps:
1. Create a new project in Vercel and link your GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. Vercel will automatically detect **Vite** as the framework.
4. Add the following **Environment Variable**:
   - `VITE_API_URL`: `https://edu-assistant-backend.onrender.com` (Use the Render backend URL you generated in step 2. Make sure it does NOT end with a trailing slash `/`).
5. Click **Deploy**.

---

## 4. Production Verifications
1. Go to your live Vercel frontend URL.
2. Sign up or log in. It will communicate with the live Render backend, which queries the Supabase database.
3. Test logging hours, creating subjects, and generating flashcards using the live interfaces!
