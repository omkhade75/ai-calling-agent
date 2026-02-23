# Agentrix — Enterprise Voice Agent Platform

Agentrix is a full-stack platform for building, deploying, and managing AI-powered voice agents. Businesses can create customized voice assistants that handle support, sales, and operations calls 24/7.

## Features

- **Voice Agent Studio** — Configure LLM, voice, transcriber, and advanced settings
- **Onboarding Wizard** — Step-by-step setup that generates custom system prompts
- **Voice Playground** — Test your assistant in-browser with live voice interaction
- **Phone Number Management** — Import numbers and manage inbound/outbound call flows
- **Business Integration** — Embed code, API keys, and widget for any website
- **Multi-Provider Support** — ElevenLabs, OpenAI TTS, Deepgram, and more

## Tech Stack

| Layer      | Tech                                      |
| ---------- | ----------------------------------------- |
| Frontend   | React · TypeScript · Tailwind CSS · Vite  |
| Backend    | Node.js · Express · MongoDB · JWT Auth    |
| Voice      | ElevenLabs · Web Speech API               |
| AI Models  | GPT-4o · Claude 3.5 · Gemini · Llama     |

## Getting Started

```bash
# Install dependencies
npm install

# Start the backend server
node server/index.js

# Start the frontend dev server (in a separate terminal)
npm run dev
```

The frontend runs on `http://localhost:8080` and the backend on `http://localhost:5000`.

## Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/Agentrix
SERVER_PORT=5000
JWT_SECRET=your-secret-key
VITE_API_URL=/api
```

## Project Structure

```
├── server/            # Express backend (auth, assistants, voice-chat)
│   ├── models/        # Mongoose schemas
│   └── routes/        # API route handlers
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page-level components (Auth, Studio, PhoneNumbers)
│   ├── integrations/  # API client layer
│   └── hooks/         # Custom React hooks
├── public/            # Static assets
└── index.html         # Entry HTML
```

## License

Proprietary — © 2026 Agentrix Enterprise Solutions.
