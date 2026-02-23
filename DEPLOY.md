# Agentrix 7D Enterprise Deployment Guide

Agentrix is built for seamless deployment using modern serverless features and a decoupled architecture. This guide provides the exact steps required to host the platform on enterprise cloud providers.

---

## 🚀 Step 1: Backend Deployment (Render.com)

Agentrix's backend runs on Node.js/Express, now utilizing an incredibly fast built-in memory store instead of an external database.

1.  Push your code to your GitHub Repository.
2.  Go to the [Render Dashboard](https://dashboard.render.com).
3.  Click **New +** -> **Web Service** -> Connect your Repo.
4.  Configure the Service:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm run start`
5.  **Environment Variables**:
    *   `PORT`: `5000` (Render explicitly maps this)
    *   `OPENAI_API_KEY`: *(Your OpenAI Secret Key)*
    *   `VITE_SUPABASE_URL`: *(Your Supabase Project URL)*
    *   `VITE_SUPABASE_ANON_KEY`: *(Your Supabase ANON Key)*

Once Render successfully builds the server, you will receive a Live URL. Save this URL for the frontend setup.

---

## 🛸 Step 2: Frontend Deployment (Vercel)

The beautiful 7D frontend is built with Vite, React, and Framer Motion. 

1.  Go to the [Vercel Dashboard](https://vercel.com).
2.  Click **Add New Project** -> Import the same GitHub repository.
3.  Configure the Build Settings:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   `VITE_API_URL`: *[Your Render Backend URL from Step 1]*
    *   `VITE_SUPABASE_URL`: *(Matches your backend config)*
    *   `VITE_SUPABASE_ANON_KEY`: *(Matches your backend config)*
5.  Click **Deploy**.

---

## 🔧 Step 3: Verification & Diagnostics

Once Vercel gives you your production Web URL:
1.  Open the live site.
2.  Authenticate with your enterprise credentials.
3.  Attempt to spawn a new 3D Voice Agent.
4.  Check the Vercel/Render logs if you encounter any "Network Error" issues. Make sure your `VITE_API_URL` correctly points to the deployed node server.

Enjoy your flawlessly deployed, modern Voice Agent Studio!
