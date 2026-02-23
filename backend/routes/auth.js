import express from 'express';
import crypto from 'crypto';
import { User } from '../db.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://hjrdlfbpmkwoolobyzjd.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcmRsZmJwbWt3b29sb2J5empkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTk1NDMsImV4cCI6MjA4NTM3NTU0M30.t6Bcqy8Mg-XaA1g4F7bnkJqviE09-UQu3e8pgsNvQUs'
);

// GET /api/auth/me — verify Supabase token & return/sync Mongoose user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);

        if (error || !sbUser) {
            return res.status(401).json({ error: 'Invalid or expired Supabase token' });
        }

        // Find or create user in MongoDB by email
        let user = await User.findOne({ email: sbUser.email });

        if (!user) {
            user = await User.create({
                email: sbUser.email,
                password: 'supabase_managed',
                displayName: sbUser.user_metadata?.displayName || '',
                publicKey: 'pk_' + crypto.randomBytes(16).toString('hex'),
                secretKey: 'sk_' + crypto.randomBytes(16).toString('hex')
            });
        }

        // Generate keys if missing
        if (!user.publicKey || !user.secretKey) {
            user.publicKey = user.publicKey || 'pk_' + crypto.randomBytes(16).toString('hex');
            user.secretKey = user.secretKey || 'sk_' + crypto.randomBytes(16).toString('hex');
        }

        res.json({
            user: {
                id: sbUser.id, // Return Supabase UUID
                email: user.email,
                displayName: user.displayName,
                publicKey: user.publicKey,
                secretKey: user.secretKey
            }
        });
    } catch (err) {
        console.error('Auth verification error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

export default router;
