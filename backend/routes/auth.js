import express from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

function getSupabase() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    return createClient(url, key);
}

// GET /api/auth/me — verify JWT and sync/create user profile in Supabase
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const supabase = getSupabase();

        const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
        if (error || !sbUser) {
            return res.status(401).json({ error: 'Invalid or expired Supabase token' });
        }

        // Find or create profile in user_profiles table
        let { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', sbUser.id)
            .single();

        if (!profile) {
            const { data: newProfile, error: createErr } = await supabase
                .from('user_profiles')
                .insert([{
                    id: sbUser.id,
                    email: sbUser.email,
                    display_name: sbUser.user_metadata?.displayName || sbUser.email?.split('@')[0] || 'User',
                    public_key: 'pk_' + crypto.randomBytes(16).toString('hex'),
                    secret_key: 'sk_' + crypto.randomBytes(16).toString('hex'),
                }])
                .select()
                .single();

            if (createErr) console.error('Profile create error:', createErr);
            profile = newProfile;
        }

        res.json({
            user: {
                id: sbUser.id,
                email: sbUser.email,
                displayName: profile?.display_name || sbUser.email,
                publicKey: profile?.public_key,
                secretKey: profile?.secret_key,
            }
        });
    } catch (err) {
        console.error('Auth /me error:', err);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

export default router;
