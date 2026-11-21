# CloudCart – 100% Free 24/7 Cloud Deployment Guide

This guide walks you through deploying the complete **CloudCart** platform to the cloud **100% free with no credit card required**. 

Once deployed, the website and backend run **24/7 in the cloud** — your computer can be completely powered off, and users worldwide can browse products, register, add items to cart, and checkout in Indian Rupees (₹).

---

## Architecture Overview

```
 ┌─────────────────────────────────────────────────────────┐
 │                   Vercel Global Edge                    │
 │               https://cloudcart.vercel.app              │
 │        (Angular 18 SPA + Responsive Mobile/Desktop)     │
 └────────────────────────────┬────────────────────────────┘
                              │ HTTPS REST API Requests
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   Render.com Free Tier                  │
 │           https://cloudcart-backend.onrender.com        │
 │       (CloudCart Unified Modular Spring Boot 3 Runtime) │
 │          Capped at 320MB RAM (-Xmx320m -XX:+UseG1GC)    │
 └────────────────────────────┬────────────────────────────┘
                              │ Secure JDBC (SSL)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                  Neon.tech Free Tier                    │
 │             Serverless PostgreSQL Database              │
 │            58 Indian Products + Stock + Users           │
 └─────────────────────────────────────────────────────────┘
```

| Component | Platform | Free Tier Quota | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Unlimited Bandwidth & Deployments | **$0.00 / mo** |
| **Backend** | [Render](https://render.com) | 1 Web Service (512MB RAM, 750 free hrs/mo) | **$0.00 / mo** |
| **Database** | [Neon.tech](https://neon.tech) | Serverless PostgreSQL (0.5GB, always-on) | **$0.00 / mo** |

---

## Step 1: Create Free PostgreSQL Database on Neon.tech (2 Mins)

Neon provides a cloud PostgreSQL database that never gets deleted and requires no credit card.

1. Go to **[https://neon.tech](https://neon.tech)** and click **Sign Up** (with GitHub or Google).
2. Click **Create Project**:
   - **Project name:** `cloudcart-db`
   - **Database name:** `neondb` (default)
   - **Region:** Choose the region closest to you (e.g., `AWS US East (Ohio)` or `AWS Asia Pacific (Singapore)`).
3. On the project dashboard, look at the **Connection Details** card:
   - Select **JDBC** from the dropdown.
   - It will show a URL like:
     ```
     jdbc:postgresql://ep-silent-hill-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - Copy and save:
     - **JDBC URL**
     - **User** (e.g. `neondb_owner`)
     - **Password** (e.g. `Abc123Xyz...`)

---

## Step 2: Push Repository to Your GitHub

If you haven't already pushed your CloudCart repository to your personal GitHub account:

1. Create a new repository on GitHub named `cloudcart`.
2. Push your code:
   ```bash
   cd /Users/omugale/.gemini/antigravity/scratch/cloudcart
   git add .
   git commit -m "Add free cloud deployment configs for Render and Vercel"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/cloudcart.git
   git branch -M master
   git push -u origin master
   ```

---

## Step 3: Deploy Backend on Render.com (3 Mins)

1. Go to **[https://render.com](https://render.com)** and sign in with GitHub.
2. In the Render Dashboard, click the blue **New +** button in top-right and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your `cloudcart` repository.
4. Fill in the service configuration:
   - **Name:** `cloudcart-backend` (or a name of your choice)
   - **Region:** Same or close to your Neon database (e.g., `Ohio (US East)` or `Oregon (US West)`)
   - **Branch:** `master` (or `main`)
   - **Runtime:** **Docker**
   - **Dockerfile Path:** `./services/cloudcart-unified/Dockerfile`
   - **Docker Context:** `.`
   - **Instance Type:** **Free** (0.1 CPU, 512 MB RAM)
5. Scroll down to **Environment Variables** and add the following:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `8080` | Server listening port |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Production profile |
   | `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit HMAC secret |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require` | *Your Neon JDBC URL* |
   | `SPRING_DATASOURCE_USERNAME` | `neondb_owner` | *Your Neon Username* |
   | `SPRING_DATASOURCE_PASSWORD` | `<your-neon-password>` | *Your Neon Password* |

6. Click **Deploy Web Service**.
7. Render will build the Docker container and start Spring Boot.
   - Flyway will automatically execute and create all database tables.
   - All 4 default users, 7 categories, 58 Indian products in INR, and inventory stock will be seeded automatically.
8. Once the log says `Started CloudCartUnifiedApplication in ... seconds`, copy your public Render URL:
   ```
   https://cloudcart-backend.onrender.com
   ```
   Verify by opening `https://cloudcart-backend.onrender.com/actuator/health` in your browser. It should respond with:
   ```json
   {"status":"UP"}
   ```

---

## Step 4: Deploy Frontend on Vercel (2 Mins)

1. Go to **[https://vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. In the Vercel dashboard, click **Add New...** $\rightarrow$ **Project**.
3. Select your `cloudcart` repository and click **Import**.
4. Configure the project settings:
   - **Project Name:** `cloudcart`
   - **Framework Preset:** **Other** (or Angular)
   - **Root Directory:** Click **Edit** and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/cloudcart-frontend/browser`
5. (Optional) In **Environment Variables**, you can set:
   - `API_URL` = `https://cloudcart-backend.onrender.com/api/v1`
   *(Or simply ensure `frontend/src/index.html` has your Render backend URL)*
6. Click **Deploy**.
7. In approximately 45 seconds, Vercel will complete the build and assign you a live HTTPS domain:
   ```
   https://cloudcart-app.vercel.app
   ```

---

## Step 5: Verify Live Website

Visit your live Vercel URL on mobile, tablet, or desktop:

1. **Browse Products:** Notice all 58 items with Indian Rupee (₹) pricing, active images, and categories.
2. **Customer Login:**
   - Email: `customer@cloudcart.com`
   - Password: `Customer123!`
3. **Cart & Checkout:** Add items to cart, proceed to checkout with Indian address (e.g. Bengaluru, Karnataka), and place order.
4. **Admin Dashboard:**
   - Log out, then log in as Admin:
   - Email: `admin@cloudcart.com`
   - Password: `Admin123!`
   - Access `/admin` to view revenue in INR, order metrics, customer count, and inventory stock.

---

## Step 6: 24/7 Keep-Alive Tip (Optional Free Optimization)

Render free tier web services spin down to sleep after **15 minutes** of inactivity to save energy. When a new visitor arrives, Render wakes up the service in about ~30-45 seconds.

To keep your Render backend **warm 24/7 with 0s latency**:
1. Go to **[https://cron-job.org](https://cron-job.org)** or **[https://uptimerobot.com](https://uptimerobot.com)** (100% free).
2. Create a new monitor pinging your backend health check every **14 minutes**:
   ```
   URL: https://cloudcart-backend.onrender.com/actuator/health
   Interval: Every 14 minutes
   ```
3. Because Render receives an HTTP request every 14 minutes, it **never goes to sleep** and stays running 24/7! (The 750 free hours per month covers an entire 744-hour month).

---

## Summary of Default Login Credentials

| Role | Email | Plaintext Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@cloudcart.com` | `Customer123!` | Storefront, Cart, Checkout, Order History |
| **Admin** | `admin@cloudcart.com` | `Admin123!` | Full Admin Dashboard, Inventory, Orders |
| **Customer (Alt)** | `customer@example.com` | `password123` | Storefront & Checkout |
| **Admin (Alt)** | `admin@cloudcart.internal` | `admin123` | Storefront & Admin Tools |
