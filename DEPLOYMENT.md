# 🚀 Deployment Guide — LectureMind AI

This guide covers how to deploy the **LectureMind AI** frontend and microservices architecture to production.

---

## 🐋 Option 1: One-Click Docker VPS Deployment (Recommended)

Since the entire application is containerized with `docker-compose.yml`, you can deploy to any VPS (DigitalOcean Droplet, AWS EC2, Hetzner, Linode, or Railway) in 3 simple steps.

### Step 1: Provision a Cloud VPS
Create a basic Ubuntu Linux VPS (minimum 2 GB RAM recommended).

### Step 2: Install Docker & Docker Compose
Connect via SSH and install Docker:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
```

### Step 3: Clone & Launch
```bash
git clone <YOUR_REPOSITORY_URL>
cd Edu-assistant
docker-compose up -d --build
```

Your web app will be live at `http://YOUR_SERVER_IP:5173` and the API Gateway at `http://YOUR_SERVER_IP:5001`.

---

## ⚡ Option 2: Serverless / Cloud Hosting (Vercel + Render / Railway)

### Frontend Deployment (Vercel or Netlify)
1. Import your GitHub repository into **Vercel** or **Netlify**.
2. Set Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable:
   - `VITE_API_URL` = `https://your-api-gateway.onrender.com`

### Backend Microservices Deployment (Render / Railway / Fly.io)
Deploy the `docker-compose.yml` file directly on **Render**, **Railway**, or **Fly.io** as a Web Service.

---

## 🌐 Option 3: Instant Public HTTPS Tunnel (Zero Setup Preview)

If you want to immediately generate a public, shareable HTTPS URL for your live local containers without setting up cloud servers or DNS:

Run this command in your terminal:
```bash
npx ngrok http 5173
```
Or with Cloudflare Tunnels:
```bash
npx cloudflared tunnel --url http://localhost:5173
```

This will give you a live HTTPS link (e.g. `https://lecturemind.ngrok-free.app`) accessible from any mobile or desktop browser globally.

---

## 🔒 Production Environment Checklist

- [x] **Database**: Supabase PostgreSQL database is connected via transaction-mode pooler.
- [x] **AI Engine**: Google Gemini API key is configured.
- [x] **Frontend Production Bundle**: Verified via `vite build` (0 syntax errors).
- [x] **Prisma Client**: Compiled with native OpenSSL Alpine binaries (`linux-musl-arm64-openssl-3.0.x`, `linux-musl`).
