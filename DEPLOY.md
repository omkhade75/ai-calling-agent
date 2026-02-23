# Deployment Guide for Agentrix

This guide explains how to deploy the Agentrix application to a production environment. Since this is a full-stack application (React Frontend + Express Backend + MongoDB), you will need to deploy these components.

## Prerequisites

1.  **MongoDB Atlas Account**: You need a cloud database. [Sign up here](https://www.mongodb.com/cloud/atlas).
2.  **GitHub Account**: To host your code.
3.  **Vercel Account**: For the Frontend.
4.  **Render or Railway Account**: For the Backend.

---

## Step 1: Database Setup (MongoDB Atlas)

1.  Create a new Cluster (Shared Tier is free).
2.  Create a Database User (username/password).
3.  Network Access: Allow access from anywhere (`0.0.0.0/0`).
4.  Get your **Connection String**:
    `mongodb+srv://<username>:<password>@cluster0.mongodb.net/Agentrix?retryWrites=true&w=majority`

---

## Step 2: Backend Deployment (Render.com)

1.  Push your code to GitHub.
2.  Go to [Render Dashboard](https://dashboard.render.com).
3.  New **Web Service** -> Connect your Repo.
4.  **Settings**:
    *   **Root Directory**: `.` (leave empty or use default)
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm run server`
5.  **Environment Variables**:
    *   `MONGODB_URI`: (Your Atlas connection string)
    *   `OPENAI_API_KEY`: (Your OpenAI key)
    *   `ELEVENLABS_API_KEY`: (Optional, your ElevenLabs key)
    *   `PORT`: `10000` (Render default) or `5000`

Once deployed, you will get a URL like `https://agentrix-backend.onrender.com`.

---

## Step 3: Frontend Deployment (Vercel)

1.  Go to [Vercel Dashboard](https://vercel.com).
2.  **Add New Project** -> Import your Repo.
3.  **Build Settings**: Default (Vite).
4.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your backend (e.g., `https://agentrix-backend.onrender.com/api`).
        *   **Note**: Make sure to include `/api` at the end if your backend routes are prefixed with `/api`.
5.  **Deploy**.

---

## Step 4: Verification

1.  Open your Vercel URL.
2.  Try to sign in or use the Voice Agent.
3.  If you see "Network Error" or 404s, check:
    *   Did you set `VITE_API_URL` correctly?
    *   Is the Backend running on Render?
    *   Check Console Logs (`F12`) for CORS errors. (The backend is configured to allow all origins `cors({ origin: '*' })`, so it should work).

## Local Development (Running locally)

To run the project on your machine:

1.  **Backend**: `npm run server` (Runs on port 5000)
2.  **Frontend**: `npm run dev` (Runs on port 8080 or 5173)

**Common Issues:**
*   `ECONNREFUSED`: You forgot to start the backend (`npm run server`).
*   `EADDRINUSE`: You have a zombie process. Use `taskkill /F /IM node.exe` (Windows) or `pkill -f node` (Mac/Linux).
