import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import assistantRoutes from './routes/assistants.js';
import voiceChatRoutes from './routes/voiceChat.js';

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/agentrix';

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: '*', // Allow all origins (dev mode)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
import publicApiRoutes from './routes/public_api.js';
import otpRoutes from './routes/otp.js';

try {
    app.use('/api/auth', authRoutes);
    app.use('/api/assistants', assistantRoutes);
    app.use('/api/voice-chat', voiceChatRoutes);
    app.use('/api/otp', otpRoutes);
    app.use('/api/public', publicApiRoutes);
} catch (routeError) {
    console.error('Error mounting routes:', routeError);
}

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve Frontend in Production
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../dist')));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

// Global Express Error Handler
app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Connect to MongoDB asynchronously
try {
    const maskedURI = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${maskedURI}`);
    mongoose
        .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch((err) => console.error('❌ MongoDB connection error:', err.message));
} catch (dbError) {
    console.error('Synchronous DB connect error:', dbError);
}

// Start server immediately (required for Railway health checks)
try {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

    server.on('error', (e) => {
        console.error('Server listen error:', e);
    });
} catch (listenError) {
    console.error('Failed to start server:', listenError);
}
