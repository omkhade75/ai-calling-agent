import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { VoiceAssistant, User } from '../db.js';

const router = express.Router();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://hjrdlfbpmkwoolobyzjd.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcmRsZmJwbWt3b29sb2J5empkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTk1NDMsImV4cCI6MjA4NTM3NTU0M30.t6Bcqy8Mg-XaA1g4F7bnkJqviE09-UQu3e8pgsNvQUs'
);

// Auth middleware
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw error || new Error("User not found");

        // Sync or find Mongoose User by email to maintain ObjectId relation
        const mUser = await User.findOne({ email: user.email });
        if (!mUser) {
            return res.status(401).json({ error: 'User not synced with database yet' });
        }

        req.userId = mUser._id; // Mongoose ObjectId
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// GET /api/assistants — list all assistants for user
router.get('/', authenticate, async (req, res) => {
    try {
        const assistants = await VoiceAssistant.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(assistants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/assistants — create assistant
router.post('/', authenticate, async (req, res) => {
    try {
        // Create new assistant with defaults merged with body
        const assistant = await VoiceAssistant.create({
            userId: req.userId,
            ...req.body,
            // Default fallback if name not provided
            name: req.body.name || 'New Assistant',
        });
        res.status(201).json(assistant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/assistants/:id — update assistant
router.put('/:id', authenticate, async (req, res) => {
    try {
        const assistant = await VoiceAssistant.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!assistant) return res.status(404).json({ error: 'Assistant not found' });
        res.json(assistant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/assistants/:id — delete assistant
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const assistant = await VoiceAssistant.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!assistant) return res.status(404).json({ error: 'Assistant not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
