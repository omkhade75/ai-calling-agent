import express from 'express';
import { User, VoiceAssistant } from '../db.js';

const router = express.Router();

// Middleware to authenticate with Public Key
const authenticatePublicKey = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Check query param or body as fallback?
            // For now, strict header.
            return res.status(401).json({ error: 'Missing Authorization header with Public Key' });
        }

        const token = authHeader.split(' ')[1];
        if (!token.startsWith('pk_')) {
            return res.status(401).json({ error: 'Invalid Public Key format' });
        }

        const user = await User.findOne({ publicKey: token });
        if (!user) {
            return res.status(401).json({ error: 'Invalid Public Key' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// POST /api/public/voice-chat
router.post('/voice-chat', authenticatePublicKey, async (req, res) => {
    try {
        const { message, assistantId, conversationHistory } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        if (!assistantId) {
            return res.status(400).json({ error: 'Assistant ID is required' });
        }

        // 1. Find the assistant and verify ownership
        const assistant = await VoiceAssistant.findOne({ _id: assistantId, userId: req.user._id });
        if (!assistant) {
            return res.status(404).json({ error: 'Assistant not found or access denied' });
        }

        // 2. Prepare context
        // Use assistant's system prompt and name
        const systemMessage = {
            role: 'system',
            content: `You are ${assistant.name}. ${assistant.systemPrompt || 'You are a helpful assistant.'}. Keep responses concise.`
        };

        const messages = [
            systemMessage,
            ...(conversationHistory || []),
            { role: 'user', content: message }
        ];

        // 3. Call OpenAI
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                error: 'Server misconfiguration: No OpenAI API Key',
                details: 'Please set OPENAI_API_KEY in .env file'
            });
        }

        // Make the request to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // or gpt-4
                messages,
                temperature: assistant.temperature || 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        res.json({
            reply,
            assistantId: assistant._id,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('Public Voice Chat Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/public/assistant/:id - Fetch config for client-side validaton or UI
router.get('/assistant/:id', authenticatePublicKey, async (req, res) => {
    try {
        const assistant = await VoiceAssistant.findOne({ _id: req.params.id, userId: req.user._id });
        if (!assistant) {
            return res.status(404).json({ error: 'Assistant not found' });
        }

        // Return safe public config
        res.json({
            id: assistant._id,
            name: assistant.name,
            voiceProvider: assistant.voiceProvider,
            voiceId: assistant.voiceId,
            // Don't expose system prompt if we want to keep it secret? 
            // Vapi exposes it in some endpoints, but usually better to keep logic server-side.
            // But if the client is doing TTS, it might need some info.
            firstMessage: "Hello, how can I help you?", // Should add this to model later
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
