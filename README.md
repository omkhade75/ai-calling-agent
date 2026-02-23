# Agentrix — 7D Enterprise Voice Agent Platform

Agentrix is a fully loaded, immersive 3D/7D full-stack platform for building, deploying, and managing elite AI-powered voice agents. Designed for high-end enterprises, businesses can create customized voice assistants to handle high-touch support, sales, and operations autonomously, 24/7.

![Agentrix - Fully 3D Immersive UI](./frontend/public/favicon.ico)

---

## 🌟 Key Features

The platform doesn’t just work—it offers an experience that feels alive, utilizing dynamic parallax, framer-motion transitions, and premium glassmorphic UI.

- **🎙️ Voice Agent Studio**: A fully 3D interactive command terminal to configure LLM, voice parameters, and injection modules.
- **✨ Onboarding Wizard**: A beautifully animated, step-by-step 3D orbital wizard that instantly generates highly effective custom system prompts based on business inputs.
- **🎧 Voice Playground**: Test your voice assistant directly in your browser with a pulsating, real-time visual "Neural Interface" that responds to the agent's state (Thinking, Speaking, Listening).
- **☎️ Phone Number Management**: Simplified comms hub for routing inbound/outbound calls.
- **💻 Web Injection Module**: Instantly embed your custom voice agent into ANY external website via a beautiful dark-mode chat widget with custom initialization configurations.
- **⚡ Local In-Memory DB Engine**: Ridiculously fast and deeply disconnected from heavy ORMs. No MongoDB configuration needed. Everything works straight out of the box!
- **🌐 Hybrid AI Capability**: Works seamlessly with Supabase Auth, OpenAI TTS, ElevenLabs, and Vadi natively!

---

## 🛠️ Technology Stack

| Architecture | Layer                         | Description                              |
| ------------ | ----------------------------- | ---------------------------------------- |
| **Frontend** | React, TypeScript, Vite       | Turbocharged client-side rendering.      |
| **Styling**  | TailwindCSS, Framer Motion    | 7D Mouse-tracking glow, glassmorphism, & premium UI loops. |
| **Backend**  | Node.js, Express              | High-performance asynchronous API engine. |
| **Storage**  | Local In-Memory `db.js` Store | Zero-setup, lightweight text-based state storage. |
| **Auth**     | Supabase, Custom JWT          | Secure authentication protocol via robust RSA/JWT keys. |

---

## 🚀 Instant Local Startup

Getting the 7D Voice Agent Studio running locally takes only seconds without ANY database configuration requirements.

```bash
# Clone the repository
git clone https://github.com/omkhade75/ai-calling-agent.git
cd ai-calling-agent

# Install dependencies for both Frontend & Backend
npm install

# Instantly boot the full stack with one command!
npm run dev
```

The system automatically configures itself and routes your API.
- **7D Web Interface**: `http://localhost:8080` (or `http://localhost:5173`)
- **Backend API Core**: `http://localhost:8081` (or `http://localhost:5000`)

### 🔑 Environment Requirements

In the root `backend/.env` file:
```env
PORT=8081
OPENAI_API_KEY=your_openai_secret_key
# The backend uses an integrated memory-store. No MongoDB strings are required!
```

In the `frontend/.env.local` file:
```env
VITE_API_URL=http://localhost:8081/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📦 Project Structure

```text
├── backend/                  # High-Performance Node Backend
│   ├── routes/               # Modular Express Logic (Auth, Voice, SDKs)
│   ├── db.js                 # Local Memory Base Engine
│   └── index.js              # Server Core & API Configuration
├── frontend/                 # 7D React Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable 3D Orbitals & Glass Components
│   │   ├── pages/            # View Pages: VoiceAgentStudio, Comms, Home
│   │   ├── index.css         # Custom Deep Space Parallax Themes
│   │   └── App.tsx           # Router & Global Mouse Effect Integrations
│   └── public/               # Asset Directory
└── README.md
```

## 📜 Legal & License

Proprietary — © 2026 Agentrix Enterprise Solutions.
No portions of this software may be distributed without explicit authorization.
